# tgz-checker
* 检查待导入verdaccio/storage目录的各npm包内是否含有.tgz文件。  
* 更改verdaccio/storage目录各包内package.json标记的最新版本号。
```
npm i -g tgz-checker
```

### 使用
```
tgz
```
命令行进入npm包所在目录，执行命令，控制台打印没有tgz文件的包名，并将日志保存于该目录。
<br><br>
  
 ```
tgz --edit
``` 
命令行进入npm包所在目录，执行带有参数命令。脚本检查verdaccio/storage目录各个包，并将包内package.json的['dist-tags']['latest']值更改为目录内现有tgz所对应的版本。
<br><br>

```
tgz --edit 包名
```
修改指定包的package.json中['dist-tags']['latest']的值