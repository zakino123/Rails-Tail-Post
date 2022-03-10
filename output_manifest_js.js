// ==================================================
// Simpacker 用 manifest.json 出力 Node.js スクリプト
// 基本の使い方：node output_manifest_js.js public
// ==================================================
// fsモジュールはファイルを読み込んだり、書き込んだりする際に使う
const fs = require('fs');
// pathモジュールはファイルパスからディレクトリ名を取得したり、ファイル名だけを取得したりするような文字列としてのパスの操作ができます。
const path = require('path');
// データを暗号化解除するためのAPI
const crypto = require('crypto')
// default ignore Path
const DEFAULT_IGNORE_PATH = 'public';
// default manifest.json path
const DEFAULT_OUTPUT_MANIFEST_PATH = 'public/packs/manifest.json';
// Cache Bustring String Source
const S = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
// Number of Cache Bustring String
const N = 6;

// Check args
function showUsageAndExit() {
  // process.argvはコマンドライン引数を受け取る
  // path.basename: ディレクトリのパスを取り除いたファイル名。拡張子抜きの場合は、第2引数に拡張子を指定する
  const basename = path.basename(process.argv[1]);
  console.error(`Usage: node ${basename} <target directory path> <optionla:ignore path> <optional:manifest.json path>`);
  // Nodeのスクリプトで正常に処理を終了
  process.exit(1);
}

const getFiles = (dirpath, callback) => {
  // withFileTypesはfs.statより簡潔なコードになる。高速にファイル一覧を取得する。
  // direntはディレクトリエントリと呼ばれるファイルやディレクトリの情報を持った構造体
  fs.readdir(dirpath, {withFileTypes: true}, (err, dirents) => {
    if (err) {
      console.error(err);
      return;
    }

    for (const dirent of dirents) {
      // path.join:パス文字列を結合する
      const fp = path.join(dirpath, dirent.name);
      // dirent.isDirectory():ディレクトリかどうかを判別する
      if (dirent.isDirectory()) {
        getFiles(fp, callback);
      } else if (ignorePath === dirpath) {
        // public ディレクトリ直下は処理対象外
        continue;
      } else if (fp === outputManifestPath) {
        // マニフェストファイルそのものは処理対象外
        continue;
      } else {
        // crypto.randomFillSync:暗号強度の強い乱数値を取得します。
        // Unit8Array:型付き配列で、8ビット符号なし整数値の配列を表します。
        cacheBustringString = Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('');
        // replace(対象の文字、置換する文字):対象の文字を置換する文字に置換する。
        outputObject[dirent.name] = `${fp.replace(ignorePath, '')}?v=${cacheBustringString}`;
        callback(fp);
      }
    }
  });
}

// process.argv[0] : Node.jsの実行プロセスのフルパス
// process.argv[1] : スクリプトファイルのフルパス
// なので3番目以降をargsに取り出す
// sliceメソッドは文字列や配列などからデータの一部分だけ取り出せるメソッド
const args = process.argv.slice(2);
if (args.length < 1) {
  showUsageAndExit();
}

if (args.length < 2) {
  args.push(DEFAULT_OUTPUT_MANIFEST_PATH);
  args.push(DEFAULT_IGNORE_PATH);
}

if (args.length < 3) {
  args.push(DEFAULT_IGNORE_PATH);
}

const checkPath = args[0];
const outputManifestPath = args[1];
const ignorePath = args[2];
const outputObject = {};
getFiles(checkPath, console.log);

// getFiles の処理が終わり切ってから実行するために setTimeout
// Promise化すれば getFiles を同期実行できそう……
// setTimeout(処理内容,実行タイミング):今回の場合、処理内容console.log、実行タイミング0.5秒
setTimeout(console.log, 500, `wait: output ${outputManifestPath} ...`);
// writeFileSync(書き出すファイルパス , データ):書き出したファイルにデータを保存する
// JSON.stringfyメソッド:JavaScript のオブジェクトや値を JSON 文字列に変換します。
setTimeout(()=>{ fs.writeFileSync(outputManifestPath, JSON.stringify(outputObject, null, 2)); }, 510);
