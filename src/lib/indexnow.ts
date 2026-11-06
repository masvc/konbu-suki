/**
 * IndexNow のキー。
 *
 * 公開して問題ない値。所有確認は `https://<サイト>/<キー>.txt` が同じ値を返すか
 * で行う仕組みなので、キーそのものが秘密情報ではない。.env ではなくここに置く。
 * public/<キー>.txt も一緒に置いてある。どちらかだけ変えると通らない。
 */
export const INDEXNOW_KEY = "5b0fe914ef004dd3aacc3fa0e40061f1";
