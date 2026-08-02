# FitMemo Web

极简健身记录 Web MVP。设计来自 Stitch 项目 **FitMemo Project UI Design**，实现本地存储、无登录。

## 开发

```bash
cd web
npm install
npm run dev
```

浏览器打开终端提示的本地地址（通常 `http://localhost:5173`）。

## 功能（MVP）

- 今日训练：空状态 / 记录中、套用模板（追加）、添加动作（联想 + 确认新增）
- 时间线、动作库 + 模板、身体关照（体重 / 围度 / 体脂）
- 导出（JSON / 文本+Prompt）、备份导入
- 饮食页占位

数据保存在 `localStorage`（`fitmemo.v1`）。

## 设计资源

原始 Stitch 导出在 `../design-import/`（`html-en/`、`screens-en/`、`DESIGN.md`）。
