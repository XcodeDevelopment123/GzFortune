//Mobile first design
/_ 📱 小型手机横屏 & 大屏手机（≥ 576px）_/
@media screen and (min-width: 576px) {
/_ 适用于：iPhone 8 Plus、Google Pixel 等 _/
}

/_ 📱 大屏手机临界点（≥ 640px）_/
@media screen and (min-width: 640px) {
/_ 适用于：iPhone 14 Pro Max（430px）、Galaxy S22 Ultra（412px）的横屏模式 _/
}

/_ 🖥️ 平板竖屏（≥ 768px）_/
@media screen and (min-width: 768px) {
/_ 适用于：iPad Mini（768px）、Surface Duo 展开状态 _/
}

/_ 💻 平板横屏 & 小桌面（≥ 992px）_/
@media screen and (min-width: 992px) {
/_ 适用于：iPad Pro 横屏（1024px）、13" 笔记本 _/
}

/_ 🖥️ 标准桌面（≥ 1200px）_/
@media screen and (min-width: 1200px) {
/_ 适用于：15" 笔记本、小型外接显示器 _/
}

/_ 🖥️ 大桌面（≥ 1440px）_/
@media screen and (min-width: 1440px) {
/_ 适用于：27" 以上显示器、iMac _/
}

//=========== Step ==============
/_ 1.内容优先：布局变化基于内容需求而非特定设备 2.流畅过渡：使用相对单位（rem/vw）和现代 CSS 函数 3.触控优先：始终优先考虑移动端触摸体验 4.渐进增强：逐步添加大屏专属功能 5.性能优化：避免过多断点（保持 5-6 个关键节点）
_/
//=========== Step ==============

//===========Use case===========
/\*
576px+：调整卡片布局为 2 列，放大按钮尺寸

640px+：显示隐藏的导航项，优化表单布局

768px+：显示侧边导航栏，启用复杂网格布局

992px+：增加内容最大宽度（max-width），优化留白间距

1200px+：显示附加信息面板，启用 hover 交互特效

1440px+：增加字体阶梯式放大，优化宽屏图像展示
\*/

==动画性能黄金准则==

1.优先使用 transform 和 opacity 属性 2.避免触发 layout 的属性（width/height/left/top） 3.使用 will-change: transform; 提前声明变化 4.限制动画持续时间（300ms 内最佳）
