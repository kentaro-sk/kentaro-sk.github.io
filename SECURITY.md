# セキュリティポリシー / Security Policy

このリポジトリは、杉浦健太郎のポートフォリオサイト（<https://kentaro-sk.github.io>）のソースコードです。

## このサイトの性質

- **静的サイト**です。サーバ側の処理・データベース・ユーザーアカウントはなく、訪問者の個人情報を収集・保存しません。
- 公開しているのは `main` ブランチの最新版だけです（古い版の保守はありません）。

## 脆弱性・問題の報告

次のようなものを見つけた場合は、**公開の Issue には書かず**、GitHub の非公開の脆弱性報告からお知らせください。

- サイトやリポジトリ（GitHub Actions のワークフロー、検証用スクリプト）の脆弱性
- リポジトリに誤って含まれてしまった秘密情報・公開すべきでない情報
- 読み込んでいる外部スクリプトの改ざんなど、サプライチェーンに関する問題

**報告先**: <https://github.com/kentaro-sk/kentaro-sk.github.io/security/advisories/new>

- 個人による無償の運用のため、対応は**ベストエフォート**です。目安として、1週間以内に受領の連絡を行います（保証ではありません）。
- 報告者の情報や報告内容は、修正が完了するまで公開しません。

### 対象外

- 第三者サービス（GitHub Pages、jsDelivr、unpkg、Google Fonts など）自体の脆弱性（各提供元へ報告してください）
- 具体的な悪用方法や影響が示されていない、自動スキャナの出力だけの報告
- サービス妨害（DoS）や、なりすまし・フィッシング等のソーシャルエンジニアリング

## 現在の取り組み

- GitHub の Secret Scanning と Push Protection を有効化し、CI で gitleaks により Git 履歴全体をスキャンしています。
- 外部 CDN から読み込むスクリプトには、改ざん検知のための SRI（Subresource Integrity）を付けています。
- 依存パッケージ（開発用のみ）は Dependabot でセキュリティ更新を監視しています。

---

## English summary

This repository contains the source of a personal portfolio website (<https://kentaro-sk.github.io>). It is a **static site** with no server-side code, database, user accounts, or collection of visitors' personal data. Only the latest `main` branch is maintained.

**Reporting a vulnerability:** please do **not** open a public issue. Use GitHub's private vulnerability reporting instead: <https://github.com/kentaro-sk/kentaro-sk.github.io/security/advisories/new>

This is a personal, unpaid project, so responses are best-effort (we aim to acknowledge within about a week, without guarantee). Issues in third-party services (GitHub Pages, jsDelivr, unpkg, Google Fonts), scanner-only reports without a demonstrated impact, denial-of-service, and social engineering are out of scope.
