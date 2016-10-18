var path = require('path');
var webpack = require('webpack');
var glob = require('glob');
/*
 extract-text-webpack-plugin插件，
 将样式提取到单独的css文件里
 */
var ExtractTextPlugin = require('extract-text-webpack-plugin');
/*
 html-webpack-plugin插件，webpack中生成HTML的插件，
 Doc:https://www.npmjs.com/package/html-webpack-plugin
 */
var HtmlWebpackPlugin = require('html-webpack-plugin');

function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},entry, basename, pathname, extname;
    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = basename;
        entries[pathname] = ['./' + entry];
    }
    return entries;
}

var entries = getEntry('src/js/page/**/*.js', 'src/js/page/');
var chunks = Object.keys(entries);
for(var key in entries){
    console.log("--ENTRIES--"+key+":"+entries[key]);
}

var config = {
    entry: entries,
    output: {
        path: path.join(__dirname, 'prod'), //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
        publicPath: '',                //模板、样式、脚本、图片等资源对应的server上的路径 /dist/ 使用根目录路径
        filename: 'js/[name].js',            //每个页面对应的主js的生成配置
        chunkFilename: 'js/[id].chunk.js'   //chunk生成的配置
    },
    module: {
        loaders: [ //加载器，关于各个加载器的参数配置，可自行搜索之。
            {
                test: /\.css$/,
                //配置css的抽取器、加载器。'-loader'可以省去
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            }, {
                test: /\.less$/,
                //配置less的抽取器、加载器。
                loader: ExtractTextPlugin.extract('css!less')
            }, {
                //html模板加载器，可以处理引用的静态资源，默认配置参数attrs=img:src，处理图片的src引用的资源
                //如配置，attrs=img:src img:data-src可以一并处理data-src引用的资源
                test: /\.html$/,
                loader: "html?attrs=img:src img:data-src"
            }, {
                //文件加载器，处理文件静态资源
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=./skin/font/[name].[ext]'
            }, {
                //图片加载器，同file-loader，将较小的图片转成base64，减少http请求
                //如下配置，将小于8192byte的图片转成base64码
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=8192&name=./skin/img/[name].[ext]' // [hash]
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
            chunks: chunks, //提取哪些模块共有的部分
            minChunks: chunks.length
        }),
        new ExtractTextPlugin('skin/[name].css') //单独使用link标签加载css并设置路径，相对于output配置中的publickPath
    ]
};

// 追加html
var pages = Object.keys(getEntry('src/page/*.ejs', 'src/page/'));
pages.forEach(function(pathname) {
    var conf = {
        filename: './' + pathname + '.html', //生成的html存放路径，相对于path
        template: './src/page/' + pathname + '.ejs', //html模板路径
        inject: false,    //js插入的位置，true/'head'/'body'/false
        title:'芒果网',
        /*
         * 压缩这块，调用了html-minify，会导致压缩时候的很多html语法检查问题，
         * 如在html标签属性上使用{{...}}表达式，所以很多情况下并不需要在此配置压缩项，
         * 另外，UglifyJsPlugin会在压缩代码的时候连同html一起压缩。
         * 为避免压缩html，需要在html-loader上配置'html?-minimize'，见loaders中html-loader的配置。
         */
         minify: { //压缩HTML文件
             removeComments: false, //移除HTML中的注释
             collapseWhitespace: true //删除空白符与换行符
         }
    };
    if (pathname in config.entry) {
        //conf.favicon = 'src/imgs/favicon.ico';
        conf.inject = 'body';
        conf.chunks = ['vendors', pathname];
        conf.hash = true;
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = config;