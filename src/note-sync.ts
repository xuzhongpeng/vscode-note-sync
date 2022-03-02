import { exec, ChildProcess } from "child_process";
import * as vscode from "vscode";
const fs = require("fs");

// import {RawCommand, CommandProcessor, BackendCommand, TerminalCommand, VSCodeCommand} from './command-processor'
export class NoteSyncExtension {
  private context: vscode.ExtensionContext;
  private config!: vscode.WorkspaceConfiguration;
  private channel: vscode.OutputChannel =
    vscode.window.createOutputChannel("Note Sync");
  private localSettings: any;
  private commitStr!: string;
  private pullCommandStr!: string;
  private pushCommandStr!: string;
  // private commandProcessor: CommandProcessor = new CommandProcessor()
  private timer!: any;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadConfig();
    this.showEnablingChannelMessage();
    context.subscriptions.push(this.channel);
    this.pullCode();
  }
  private showEnablingChannelMessage() {
    let message = `Note Sync is ${this.getEnabled() ? "enabled" : "disabled"}`;
    this.showChannelMessage(message);
    this.showStatusMessage(message);
  }
  loadConfig() {
    this.config = vscode.workspace.getConfiguration("noteSync");
    try {
      let localSettingStr = fs.readFileSync(
        `${vscode.workspace.rootPath}/.vscode/noteSync.json`,
        "utf8"
      );
      this.localSettings = JSON.parse(localSettingStr);
    } catch (e) {
      this.localSettings = {};
    }
    /// 初始化一些数据
    this.commitStr = this.getCommitMessage();
    this.pullCommandStr = this.pullCommand();
    this.pushCommandStr = this.pushCommand(this.commitStr);
  }
  //判断插件是否开启
  getEnabled(): boolean {
    return (
      !!this.context.globalState.get("enabled", true) &&
      !!this.config.enableNoteSync
    );
  }
  //右下角弹框提示
  private showChannelMessage(message: string) {
    this.channel.appendLine(message);
  }
  //左下角状态栏提示
  private showStatusMessage(message: string) {
    let disposable = vscode.window.setStatusBarMessage(message, 2000);
    this.context.subscriptions.push(disposable);
  }
  //执行脚本
  private execShellCommand(command: string): ChildProcess {
    let shell = this.getShellPath();
    if (shell) {
      return exec(command, {
        shell,
        cwd: vscode.workspace.rootPath,
      });
    } else {
      return exec(command);
    }
  }
  // 获取脚本环境 unix上默认是/bin/sh，windows上默认是cmd.exe
  private getShellPath(): string | undefined {
    return this.localSettings["shell"] || this.config.get("shell") || undefined;
  }
  private getCommitMessage(): string {
    return this.config.pushCommitMessage ?? "note sync plugin synchronization";
  }
  private pullCommand(): string {
    return (
      this.localSettings["pullCommand"] ||
      this.config.get("pullCommand") ||
      `git -C "${vscode.workspace.rootPath}" pull -f`
    );
  }
  private pushCommand(pushCommit: string): string {
    let pushCommandStr: string | undefined = this.localSettings["pushCommand"];
    pushCommandStr = pushCommandStr ?? this.config.get("pushCommand");
    let path = vscode.workspace.rootPath;
    if (pushCommandStr) {
      // eslint-disable-next-line @typescript-eslint/semi
      return pushCommandStr
        .toString()
        .replace(/\${path}/g, path ?? "")
        .replace(/\${pushCommit}/g, pushCommit);
    }
    return `git -C ${path} add .&&git -C ${path} commit -m "${pushCommit}"&&git -C ${path} push -u origin HEAD`;
  }
  //下拉笔记
  private pullCode() {
    if (!this.getEnabled()) {
      return;
    }
    let path = vscode.workspace.rootPath;
    let pullShell = this.pullCommandStr;
    return new Promise((resolve) => {
      this.showChannelMessage(`Running ${pullShell}`);
      if (this.config.pullStatusMessage) {
        this.showStatusMessage(this.config.pullStatusMessage);
      }
      //使用git同步
      let child = this.execShellCommand(pullShell);
      child?.stdout?.on("data", (data) => this.channel.append(data.toString()));
      child?.stderr?.on("data", (data) => this.channel.append(data.toString()));
      child.on("exit", async (e) => {
        if (e === 0 && this.config.finishStatusMessage) {
          this.showStatusMessage(this.config.finishStatusMessage);
        }

        if (e !== 0) {
          this.channel.show(true);
        }
        resolve();
      });
    }) as Promise<void>;
  }
  //提交笔记
  pushCode() {
    //添加缓存
    if (this.timer != undefined) {
      clearTimeout(this.timer);
    }
    return new Promise((resolve) => {
      this.timer = setTimeout(() => {
        this.timer = undefined;
        let path = vscode.workspace.rootPath;
        console.log(path);
        let pushCommit = this.commitStr;
        let pushShell = this.pushCommandStr;
        // sleep ${this.config.timeout}&
        console.log(pushShell);
        this.showChannelMessage(`Running ${pushShell}`);
        if (this.config.pushStatusMessage) {
          this.showStatusMessage(this.config.pushStatusMessage);
        }
        //同步
        let error = "";
        let child = this.execShellCommand(pushShell);
        child?.stdout?.on("data", (data) =>
          this.channel.append(data.toString())
        );
        child?.stderr?.on("data", (data) => {
          error += data;
          this.channel.append(data.toString());
        });
        child.on("exit", (e) => {
          if (e === 0 && this.config.finishStatusMessage) {
            this.showStatusMessage(this.config.finishStatusMessage);
          }
          if (e !== 0) {
            if (error.indexOf("git pull ...") != -1) {
              this.pullCode();
            } else {
              this.showStatusMessage("note sync err");
            }
          }
          resolve();
        });
      }, this.config.delayTime ?? 10000);
    }) as Promise<void>;
  }
}
