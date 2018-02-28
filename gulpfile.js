const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks-html');//模板插件
const sass = require('gulp-sass');//sass插件
const sourcemaps = require('gulp-sourcemaps');//资源图插件，配合sass插件使用
const prefix = require('gulp-autoprefixer');//自动添加css前缀
const htmlMin = require('gulp-htmlmin');//压缩html 
const htmlbeautify = require('gulp-html-beautify');
const imagemin = require('gulp-imagemin');//图片压缩
const pngquant = require('imagemin-pngquant'); // 深度压缩  
const changed = require('gulp-changed');//检查改变状态  
const debug = require('gulp-debug');
const uglify = require('gulp-uglify');//js混淆压缩
const babel = require("gulp-babel");//js转义
const concat = require("gulp-concat");//js文件合并

const del = require('del');//清理文件
const browserSync = require('browser-sync').create();

const Config = {
	title: '布局管理系统',
	index: 'index.html',
	dist: 'dist',
	distImage: 'dist/images',
	distCss: 'dist/css',
	distScript: 'dist/js',
	server:{
		port:8080
	}
}

gulp.task('del',(cb)=>{
	return del([
		"dist/*.*",
		"dist/css/**/*",
		"dist/image/*",
		"dist/js/**/*"
	],cb)
})

gulp.task('copy:jquery', (cb) => {
	return gulp.src("node_modules/jquery/dist/jquery.min.js").pipe(gulp.dest(Config.distScript));
});

gulp.task('nunjucks', () => {
	var options = {
		removeComments: true,//删除注释，但是会保留script和style中的注释 
		collapseWhitespace: true,//删除空白字符
		preserveLineBreaks: true, //是否在删除空白字符时保留至少一个换行
		collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
		removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
		removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"  
		removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"  
		minifyJS: false,//压缩页面JS  
		minifyCSS: true//压缩页面CSS  
	};
	return gulp.src('src/templates/pages/*.html')
		.pipe(debug({ title: 'unicorn:' }))
		.pipe(changed(Config.dist, { hasChanged: changed.compareSha1Digest }))
		.pipe(nunjucks({
			locals: { title: Config.title },
			searchPaths: ['src/templates']
		}))
		.pipe(htmlMin(options))
		.pipe(htmlbeautify({
			"preserve_newlines": false,
			// 这里是关键，可以让一个标签独占一行
			unformatted: true,
			// 默认情况下，body | head 标签前会有一行空格
			extra_liners: []
		}))
		.pipe(gulp.dest(Config.dist))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('sass', () => {
	return gulp.src('src/sass/**/*.scss')
		.pipe(changed(Config.distCss, { hasChanged: changed.compareSha1Digest }))
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(prefix())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(Config.distCss))
		.pipe(browserSync.reload({ stream: true }))
});

gulp.task('images', () => {
	return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(changed(Config.distImage, { hasChanged: changed.compareSha1Digest }))
		.pipe(imagemin({
			optimizationLevel: 7, //类型：Number  默认：3  取值范围：0-7（优化等级）
			progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
			multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
			use: [pngquant()] // 使用pngquant插件进行深度压缩  
		}))
		.pipe(gulp.dest(Config.distImage))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task("script", () => {
	return gulp.src("src/script/**/*.js")
		.pipe(changed(Config.distScript, { hasChanged: changed.compareSha1Digest }))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat("app.js"))
		.pipe(uglify({ mangle: true }))//是否混淆变量名
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(Config.distScript))
		.pipe(browserSync.reload({ stream: true }));
})
gulp.task('server', ['del','copy:jquery', 'script', 'sass', 'images', 'nunjucks'], function () {
	browserSync.init({
		port: Config.server.port,
		server: {
			baseDir: [Config.dist],
			index: Config.index
		}
	});
	gulp.watch('src/sass/**/*.scss', ['sass']);
	gulp.watch('src/templates/**/*.html', ['nunjucks']);
	gulp.watch('src/script/**/*.js', ['script']);
});