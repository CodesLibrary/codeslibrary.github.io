// project paths are set in package.json
const paths = require("./package.json").paths;

const gulp = require("gulp");
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const tailwindcss = require("tailwindcss");
const browserSync = require("browser-sync").create();
const rename = require("gulp-rename");
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const atImport = require('postcss-import');
// Custom extractor for purgeCSS, to avoid stripping classes with `:` prefixes
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

// compiling tailwind CSS
gulp.task("css", () => {
  return gulp
    .src(paths.src.css + "*.css")
    .pipe(
      postcss([tailwindcss(paths.config.tailwind), require("autoprefixer"),require("postcss-import")])
    )
    .pipe(
      purgecss({
        content: [paths.dist.base + "*.html"],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html", "js"]
          }
        ]
      })
    )
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(paths.dist.css));
});

// browser-sync dev server
gulp.task("serve", ["css"], () => {
  browserSync.init({
    server: {
      baseDir: "./"

    }
  });


  gulp.watch(paths.src.css + "*.css", ["css"]);
  gulp.watch(paths.config.tailwind, ["css"]);
  gulp.watch(paths.dist.base + "*.html",["css"]);
  gulp.watch(paths.dist.base + "*.html").on("change", browserSync.reload);
});

gulp.task('image', () =>
gulp.src(paths.src.assets + '/*')
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist.assets))
);

// default task
gulp.task("default", ["serve","image"]);



