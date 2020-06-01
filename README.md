## 安装

```
yarn install
```

## 运行

```
yarn start
```

## 如果因为下载obs库安装失败
 2. 那么就修改 `package.json`:

    ```json
    {
        "devDependencies": {
            "obs-studio-node": "file://C:/where/you/cloned/obs-studio-node/build/obs-studio-node-0.3.21-win64.tar.gz"
        }
    }
    ```


## log

log文件在 `osn-data\node-obs\logs`.

## 参考

源obs库
https://obsproject.com/

node封装的obs库(参考/抄了很多这个项目的测试类)
https://github.com/stream-labs/obs-studio-node

vue版本的node_obs(参考/抄了很多这个项目的代码)
https://github.com/stream-labs/streamlabs-obs
