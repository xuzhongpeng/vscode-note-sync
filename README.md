# Note Sync - VSCode Extension

## Features(功能)

1. Automatically synchronize code after opening notes
2. After saving the file, automatically push all files to GitHub or Gitlab

1. 打开笔记后自动同步代码（建议在需要使用该插件的项目中在`.vscode->settings`中配置`noteSync.enableNoteSync`:`true`，否则不运行此插件，为了使用其它项目的时候的性能和安全）
2. 保存代码后自动Push代码到Github或者Gitlab



## Attention（注意）

It is recommended to open the '. Vscode > Settings' in the project that needs to use the plug-in` noteSync.enableNoteSync `Otherwise, the plug-in will not be run. In order to use the performance and security opened by other projects

建议在需要使用该插件的项目中在`.vscode->settings`中配置`noteSync.enableNoteSync`:`true`，否则不运行此插件，为了使用其它项目开启的性能和安全

## Configuration

| Name                             | Description | Default
| ---                              | --- | ---
| `noteSync.enableNoteSync` | you can open note sync plugin with `true` | `false`
| `noteSync.delayTime`             | delay time to synchronization projects.The `push` command will be executed after `delayTime`| `10000` millisecond.
| `noteSync.shell`                | Specify in which shell the commands are executed, defaults to the default vscode shell.unix default is `/bin/sh`，windows default is `cmd.exe`| `null`
| `noteSync.pullCommand`|Specify the command to be executed after project is open|`null`
| `noteSync.pushCommitMessage`| push commit message to github or gitlab.Only works when `noteSync.pushCommand` is not set|`note-sync syncing`
| `noteSync.pushCommand`|Specify the command to be executed after file saved.|`null`
| `noteSync.pullStatusMessage`|Specify the status bar message when the shell command began to run.|`Note pulling`
| `noteSync.pushStatusMessage`|Specify the status bar message when the shell command is running.|`Notes uploading`
| `noteSync.finishStatusMessage`|Specify the status bar message after the shell command finished executing.|`Note upload complete`

## Sample Configuration

```
{
  "noteSync.enableNoteSync": true,
  "noteSync.delayTime": 30000,
  "noteSync.pullStatusMessage": "Note pulling",
  "noteSync.pushStatusMessage": "Notes pushing",
  "noteSync.finishStatusMessage": "Note upload complete",
}
```
## License
MIT
