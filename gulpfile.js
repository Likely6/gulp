/*该配置功能：为css添加前缀并编译压缩css，压缩和检查js代码，为css和js文件名添加md5防止缓存。
 *			 压缩html和替换html里css和js的文件名。图片压缩。
 *
 * 开发时改动后可自动刷新浏览器，并实现浏览器同步
 */

var gulp = require('gulp');

// 分别是添加前缀、压缩css、sass编译
var autoprefixer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
var sass = require('gulp-sass');
// 分别是js压缩、js代码检查 注:gulp-jshint 需要install jshint
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
// 图片压缩
var imagemin = require('gulp-imagemin');
// html压缩
var htmlmin = require('gulp-htmlmin');
// 浏览器同步
var browserSync = require('browser-sync');
// 为css、js添加添加MD5防止缓存问题
var rev = require('gulp-rev');
// 将html里的css、js默认引用路径替换成带MD5的路径
var revCollector = require('gulp-rev-collector');
// 清除文件
var clean = require('gulp-clean');



gulp.task('css',function(){
	// css添加前缀、scss编译、压缩、添加哈希码
	return gulp.src('src/css/*.scss')
		.pipe(autoprefixer())
		.pipe(sass())
		.pipe(cleancss())
		.pipe(rev())
		.pipe(gulp.dest('./dist/css/'))
		.pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'));
})
gulp.task('css-dev',function(){
	// css添加前缀、scss变译
	return gulp.src('src/css/*.scss')
		.pipe(autoprefixer())
		.pipe(sass())
		.pipe(gulp.dest('./src/css/'))
})

gulp.task('js',function(){
	// js检验、压缩、添加哈希码
	return gulp.src('src/js/*.js')
		.pipe(jshint())
		.pipe(uglify())
		.pipe(rev())
		.pipe(gulp.dest('./dist/js'))
		.pipe(rev.manifest())
		// 为文件添加MD5后生成一个json文件,rev-collector替换路径时用到
        .pipe(gulp.dest('./rev/js'));
})

// 这里的revcollector依赖于rev生成的json,所以要执行完['css','js']后执行替换操作
gulp.task('html',['css','js'],function(){
	var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        minfyJS: true,//压缩JS
        minfyCss: true,//压缩CSS
    };
    // 找到上面生成的json文件
	return gulp.src(["rev/**/*.json","src/*.html"])
	// 替换
    .pipe(revCollector())
    .pipe(htmlmin(options))
    .pipe(gulp.dest('./dist/'));
})

gulp.task('images',function(){
	// 图片压缩
	return gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('./dist/images'))
})

gulp.task('copyfile',function(){
	return gulp.src('src/libs/*')
		.pipe(gulp.dest('./dist/libs'))
})

gulp.task('clean',function(){
	// 必须返回
	return gulp.src('./dist')
		.pipe(clean())
})

gulp.task('browserSync',function(){
	browserSync.init({
		files:['src/*'],
		server:{
			baseDir:'./src',
			index:'index.html'
		},
		port:8888
	})
	// 注意：watch变化时别忘了执行html
	gulp.watch('src/js/*').on('change',browserSync.reload);
	gulp.watch('src/css/*').on('change',browserSync.reload);
	gulp.watch('src/images/*').on('change',browserSync.reload);
	gulp.watch('src/*.html').on('change',browserSync.reload);
})


// 开发环境
gulp.task('dev',function(){
	gulp.start('css-dev','browserSync')
});
// 打包上线环境
gulp.task('build',['clean'],function(){
	gulp.start('html','images','copyfile')
});