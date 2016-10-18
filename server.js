var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.js');
config.entry.app.unshift("webpack-dev-server/client?http://0.0.0.0:9999/", "webpack/hot/dev-server");
var server = new WebpackDevServer(webpack(config), {
    hot: true,
    noInfo: false,
    historyApiFallback: true,
    stats: {
        colors: true
    }
});

//将其他路由，全部返回index.html
server.app.get('*', function (req,res) {
    res.sendFile(__dirname + '/index.html')
});

server.listen(9999, '0.0.0.0', function(err) {
    if (err) {
        console.log(err);
    }
    console.log('系统启动，监听9999端口中...');
});