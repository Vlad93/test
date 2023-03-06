const { src, dest, series, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const bulk = require('gulp-sass-bulk-importer');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const ttf2woff2 = require('gulp-ttftowoff2');
const ttf2woff = require('gulp-ttf2woff');
const svgSprite = require('gulp-svg-sprite');
const webp = require('gulp-webp');
const changed = require('gulp-changed');
const multiDest = require('gulp-multi-dest');
const plumber = require('gulp-plumber');
const image = require('gulp-image');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync').create();

let isDevFlag = false;

const clean = () => {
  return del(['dist', 'dev'])
}

const resourcesJs = () => {
  return src([
    'src/resources/**/*.js',
    'src/resources/**/*.js.map'
  ])
  .pipe(gulpif(isDevFlag, dest('dev/js')))
  .pipe(gulpif(!isDevFlag, dest('dist/js')))
}

const resourcesCss = () => {
  return src('src/resources/**/*.css')
  .pipe(gulpif(isDevFlag, dest('dev/css')))
  .pipe(gulpif(!isDevFlag, dest('dist/css')))
}

const fonts = (done) => {
  src('src/fonts/**/*.ttf')
    .pipe(changed('dev/fonts', {
      extension: '.woff2',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(changed('dist/fonts', {
      extension: '.woff2',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(ttf2woff2())
    // .pipe(multiDest(['dist/fonts', 'dev/fonts']))
    .pipe(gulpif(isDevFlag, dest('dev/fonts')))
    .pipe(gulpif(!isDevFlag, dest('dist/fonts')))
  src('src/fonts/**/*.ttf')
    .pipe(changed('dev/fonts', {
      extension: 'woff',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(changed('dist/fonts', {
      extension: 'woff',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(ttf2woff())
    // .pipe(multiDest(['dist/fonts', 'dev/fonts']))
    .pipe(gulpif(isDevFlag, dest('dev/fonts')))
    .pipe(gulpif(!isDevFlag, dest('dist/fonts')))
  done();
}

const styles = () => {
  return src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(bulk())
		.pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
		.pipe(autoprefixer({
      cascade: false,
      overrideBrowserslist: ['last 8 versions'],
      browsers: [
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 11',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6',
      ],
    }))
		.pipe(cleanCSS({
      level: 2
    }))
		.pipe(concat('style.min.css'))
    .pipe(gulpif(isDevFlag, sourcemaps.write()))
    .pipe(gulpif(isDevFlag, dest('dev/css')))
    .pipe(gulpif(!isDevFlag, dest('dist/css')))
    // .pipe(gulpif(isDevFlag, browserSync.stream()))
    .pipe(browserSync.stream())
}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(gulpif(isDevFlag, dest('dev')))
    .pipe(htmlMin({
      collapseWhitespace: true
    }))
    // .pipe(multiDest(['dist', 'dev']))
    .pipe(gulpif(!isDevFlag, dest('dist')))
    // .pipe(gulpif(isDevFlag, browserSync.stream()))
    .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    // .pipe(multiDest(['dist/img', 'dev/img']))
    .pipe(gulpif(isDevFlag, dest('dev/img')))
    .pipe(gulpif(!isDevFlag, dest('dist/img')))
}

const imagesDev = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/*.svg',
    'src/images/**/*.jpeg'
  ])
    .pipe(gulpif(isDevFlag, dest('dev/img')))

}

const images = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/*.svg',
    'src/images/**/*.jpeg'
  ])
    .pipe(changed('dist/img'))
    // .pipe(changed('dev/img'))
    .pipe(image())
    // .pipe(gulpif(isDevFlag, dest('dev/img')))
    .pipe(gulpif(!isDevFlag, dest('dist/img')))
}

const webpConv = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/**/*.jpeg'
  ])
    .pipe(plumber())
    .pipe(changed('dist/img', {
      extension: '.webp'
    }))
    .pipe(changed('dev/img', {
      extension: '.webp'
    }))
    .pipe(webp())
    // .pipe(multiDest(['dist/img', 'dev/img']))
    .pipe(gulpif(isDevFlag, dest('dev/img')))
    .pipe(gulpif(!isDevFlag, dest('dist/img')))
}

const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/index.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(concat('app.min.js'))
    // .pipe(gulpif(!isDevFlag, uglify().on('error', notify.onError())))
    .pipe(uglify().on('error', notify.onError()))
    .pipe(gulpif(!isDevFlag, dest('dist/js')))
    .pipe(gulpif(isDevFlag, sourcemaps.write()))
    .pipe(gulpif(isDevFlag, dest('dev/js')))
    .pipe(browserSync.stream())
}

const setMode = (isDev) => {
  return cb => {
    isDevFlag = isDev;
    cb();
  };
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dev'
    }
  })
}

const dev =  parallel(resourcesJs, resourcesCss, fonts, htmlMinify, scripts, styles, svgSprites, imagesDev, webpConv);

watch('src/**/*.html', htmlMinify);
watch('src/scss/**/*.scss', styles);
watch('src/images/svg/**/*.svg', svgSprites);
watch('src/images/svg/**', images);
watch('src/images/**/*', imagesDev);
watch('src/images/**/*', webpConv);
watch('src/js/**/*.js', scripts);
watch('src/resources/**/*.js', resourcesJs);
watch('src/resources/**/*.css', resourcesCss)

exports.styles = styles;
exports.scripts = scripts;
exports.htmlMinify = htmlMinify;
exports.fonts = fonts;
exports.images = images;
exports.imagesDev = imagesDev;
exports.webpConv = webpConv;
exports.svgSprites = svgSprites;
exports.watchFiles = watchFiles;
exports.dev = series(clean, setMode(true), dev, watchFiles);
exports.build = series(clean, dev, images);

