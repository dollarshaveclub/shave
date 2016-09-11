import path from 'path'
import expect from 'expect.js'
import vinyl from 'vinyl-fs'
import sassGlob from '../src'

describe('gulp-sass-glob', () => {
  it('(scss) should parse a single directory AND support single and double quotes @import usage', (done) => {
    const expectedResult = [
      '@import "import/_f1.scss";',
      '@import "import/_f2.scss";',
      '@import "import/_f1.scss";',
      '@import "import/_f2.scss";'
    ].join('\n')

    vinyl
      .src(path.join(__dirname, '/test-scss/single-directory.scss'))
      .pipe(sassGlob())
      .on('data', (file) => {
        const contents = file.contents.toString('utf-8').trim()
        expect(contents).to.equal(expectedResult.trim())
      })
      .on('end', done)
  })

  it('(sass) should parse a single directory', (done) => {
    const expectedResult = [
      '@import "import/_f1.scss"',
      '@import "import/_f2.scss"'
    ].join('\n')

    vinyl
      .src(path.join(__dirname, '/test-scss/single-directory.sass'))
      .pipe(sassGlob())
      .on('data', (file) => {
        const contents = file.contents.toString('utf-8').trim()
        expect(contents).to.equal(expectedResult.trim())
      })
      .on('end', done)
  })

  it('(scss) should parse a directory recursively', (done) => {
    const expectedResult = [
      '@import "recursive/_f1.scss";',
      '@import "recursive/_f2.scss";',
      '@import "recursive/nested/_f3.scss";'
    ].join('\n')

    vinyl
      .src(path.join(__dirname, '/test-scss/recursive.scss'))
      .pipe(sassGlob())
      .on('data', (file) => {
        const contents = file.contents.toString('utf-8').trim()
        expect(contents).to.equal(expectedResult.trim())
      })
      .on('end', done)
  })

  it('(scss) should find multiple imports', (done) => {
    const expectedResult = [
      '@import "recursive/_f1.scss";',
      '@import "recursive/_f2.scss";',
      '@import "recursive/nested/_f3.scss";',
      '@import "import/_f1.scss";',
      '@import "import/_f2.scss";'
    ].join('\n')

    vinyl
      .src(path.join(__dirname, '/test-scss/multiple.scss'))
      .pipe(sassGlob())
      .on('data', (file) => {
        const contents = file.contents.toString('utf-8').trim()
        expect(contents).to.equal(expectedResult.trim())
      })
      .on('end', done)
  })

  it('(scss) should ignore commented globs', (done) => {
    vinyl
      .src(path.join(__dirname, '/test-scss/ignore-comments.scss'))
      .pipe(sassGlob())
      .on('data', (file) => {
        const contents = file.contents.toString('utf-8').trim()
        expect(contents).to.equal(contents)
      })
      .on('end', done)
  })
})
