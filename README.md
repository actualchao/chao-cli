## 

## 安装

```sh
npm i -g cgone-cli
```

## 使用

```sh
# 按照模板初始化项目
cgone init [app-name]

# 发布到服务器
cgone deploy
```

## 已经支持的模版

- `vw-app` 移动端适配方案下的 h5 项目模版.

根据命令输入项目名称，选择相应的 `template` 模版，生成对应的项目的模版结构。


## 发布条件

基于 ssh 免密登陆的密钥。通过 ssh scp 上传代码