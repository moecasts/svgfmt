import './index.css';
import 'iconify-icon';
import customIcons from '@iconify-json/custom/icons.json';
// 导入并注册自定义图标集
import { addCollection } from 'iconify-icon';

// 注册图标集
addCollection(customIcons);

const rootEl = document.querySelector('#root');

if (rootEl) {
  rootEl.innerHTML = `
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-[3.6rem] font-bold mb-4">Vanilla Rsbuild</h1>
      <p class="text-[1.2rem] text-black/50 mb-8">Start building amazing things with Rsbuild.</p>
      <div class="flex justify-center gap-4">
      <span class="icon-[mdi-light--home]"></span>

        <iconify-icon icon="custom:arrow-left" class="text-green-500 text-4xl"></iconify-icon>
        <iconify-icon icon="custom:circle" class="text-blue-500 text-4xl"></iconify-icon>
        <iconify-icon icon="custom:home" class="text-red-500 text-4xl"></iconify-icon>
      </div>
    </div>
  </div>
  `;
}
