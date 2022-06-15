import * as vscode from "vscode";
import { NoteSyncExtension } from "./note-sync";
export function activate(context: vscode.ExtensionContext) {
  let config = vscode.workspace.getConfiguration("noteSync");
  let isActive = config.enableNoteSync;
  let noteSync = new NoteSyncExtension(context);

  // 文件创建、文件删除监听
  var watcher = vscode.workspace.createFileSystemWatcher("**");
  watcher.onDidCreate((path) => {
    if (isActive && !new RegExp(".git").test(path.path)) {
      noteSync.pushCode();
    }
  });
  watcher.onDidDelete((path) => {
    if (isActive && !new RegExp(".git").test(path.path)) {
      noteSync.pushCode();
    }
  });

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      //这里只做一件事情 就是重新刷新配置
      noteSync.loadConfig();
    }),
    //  todo 添加命令active插件
    //  {
    // 	"command": "extension.enableNoteSync",
    // 	"title": "Note Sync: Enable"
    //   },
    //   {
    // 	"command": "extension.disableNoteSync",
    // 	"title": "Note Sync: Disable"
    //   }
    // vscode.commands.registerCommand('extension.enableNoteSync', () => {
    // 	//执行enable命令时 修改配置并开启插件
    // 	console.log("loading1")
    // }),

    // vscode.commands.registerCommand('extension.disableNoteSync', () => {
    // 	//执行disableNoteSync命令时 修改配置并关闭插件
    // 	console.log("loading2")
    // }),
    //todo文件保存前需要做的事情放这里
    // vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
    //
    // 	if (isActive) {

    // 	}
    // }),

    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      //文件保存后要做的事情放这里
      if (isActive) {
        noteSync.pushCode();
      }
      if (document.fileName.includes("noteSync")) {
        noteSync.loadConfig();
      }
    })
  );

  // return extension
}

// this method is called when your extension is deactivated
export function deactivate() {}
