'use strict';

const gulp = require('gulp');

const mustache = require('gulp-mustache');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');

const autoprefixer = require('autoprefixer');
const customProperties = require('postcss-custom-properties');
const cssImport = require('postcss-import');
const cssClean = require('postcss-clean');
const customMedia = require('postcss-custom-media');
const declarationSorter = require('css-declaration-sorter');

const server = require('live-server');

const paths = {
	html: {
		src: './src/views/*.mustache',
		partials: './src/partials/**/*.mustache',
		dist: './dist/'
	},
	css: {
		src: './src/partials/**/*.css',
		dist: './dist/css/'
	},
	js: {
		src: './src/partials/**/*.js',
		dist: './dist/js'
	},
	media: {
		src: './src/assets/media/*.{svg,png,jpg,mp4}',
		dist: './dist/assets/media'
	}
};

gulp.task('build:html', function () {
  return gulp.src(paths.html.src)
    .pipe(mustache({}))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(paths.html.dist))
});

gulp.task('build:css', function () {
	var cssProcessors = [
		cssImport(),
		customProperties(),
		customMedia(),
		autoprefixer({remove: false}),
		cssClean()
	];

  return gulp.src(paths.css.src, {since: gulp.lastRun('build:css')})
		.pipe(postcss(cssProcessors))
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest(paths.css.dist))
});

gulp.task('build:js', function () {
	return gulp.src(paths.js.src, {since: gulp.lastRun('build:js')})
		.pipe(gulp.dest(paths.js.dist))
});

gulp.task('build:media', function () {
	return gulp.src(paths.media.src, {since: gulp.lastRun('build:media')})
		.pipe(imagemin())
		.pipe(gulp.dest(paths.media.dist))
});

gulp.task('build', gulp.parallel([
	'build:html',
	'build:css',
	'build:js',
	'build:media'
]));

gulp.task('watch:html', function () {
	gulp.watch([paths.html.src, paths.html.partials], gulp.task('build:html'));
});

gulp.task('watch:css', function () {
	gulp.watch(paths.css.src, gulp.task('build:css'));
});

gulp.task('watch:js', function () {
	gulp.watch(paths.js.src, gulp.task('build:js'));
});

gulp.task('watch:media', function () {
	gulp.watch(paths.media.src, gulp.task('build:media'));
});

gulp.task('watch', gulp.parallel([
	'watch:html',
	'watch:css',
	'watch:js',
	'watch:media'
]));

gulp.task('form:css', function () {
	return gulp.src(paths.css.src, {since: gulp.lastRun('build:css')})
		.pipe(postcss([declarationSorter({order: 'smacss'})]))
		.pipe(gulp.dest('./src/partials/'))
});

gulp.task('server', function () {
	var serverConfig = {
		root: './dist/',
		browser: 'google-chrome'
	};

	server.start(serverConfig);
});

gulp.task('default', gulp.parallel('server', gulp.series('form:css', 'build', 'watch')));
