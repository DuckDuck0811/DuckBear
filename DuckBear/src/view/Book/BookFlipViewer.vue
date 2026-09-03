<template>
  <div class="book-viewer">
    <div v-if="loading" class="loading">Đang tải sách...</div>
    <div ref="flipContainer" class="flip-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PageFlip } from "page-flip";

import { getMaterialByBookApi, getMaterialFileApi } from "@/api/material";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const props = defineProps({
  bookId: { type: [String, Number], required: true },
});

const flipContainer = ref(null);
const loading = ref(true);
let pageFlip = null;
let blobUrl = null;

async function loadBookPdf() {
  const { data: material } = await getMaterialByBookApi(props.bookId);
  const res = await getMaterialFileApi(material.id);
  const fileBlob = res.data;

  if (fileBlob.type === "application/json") {
    const text = await fileBlob.text();
    console.error("Lỗi từ server:", JSON.parse(text));
    throw new Error("Không tải được file PDF");
  }

  blobUrl = URL.createObjectURL(fileBlob);
  const pdf = await pdfjsLib.getDocument({ url: blobUrl }).promise;
  const pageImages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    // Tăng lại scale thành 0.9 - hiển thị rõ hơn
    const viewport = page.getViewport({ scale: 0.9 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context, viewport }).promise;
    // Tăng quality lên 0.6 - vẫn nhỏ file nhưng rõ hơn
    try {
      pageImages.push(canvas.toDataURL("image/webp", 0.6));
    } catch {
      pageImages.push(canvas.toDataURL("image/jpeg", 0.6));
    }
  }

  return pageImages;
}

function buildFlipBook(pageImages) {
  pageImages.forEach((src) => {
    const pageEl = document.createElement("div");
    pageEl.className = "page";
    const img = document.createElement("img");
    img.src = src;
    pageEl.appendChild(img);
    flipContainer.value.appendChild(pageEl);
  });

  const availH = flipContainer.value.clientHeight || window.innerHeight;
  const availW = flipContainer.value.clientWidth || window.innerWidth;
  const ratio = 320 / 427;
  let h = availH;
  let w = h * ratio;
  if (w > availW / 2) {
    w = availW / 2;
    h = w / ratio;
  }

  pageFlip = new PageFlip(flipContainer.value, {
    width: Math.floor(w),
    height: Math.floor(h),
    size: "fixed",
    minWidth: 180,
    maxWidth: 350,
    minHeight: 240,
    maxHeight: 470,
    showCover: true,
    mobileScrollSupport: true,
  });

  pageFlip.loadFromHTML(flipContainer.value.querySelectorAll(".page"));
}

onMounted(async () => {
  try {
    const pageImages = await loadBookPdf();
    loading.value = false;
    buildFlipBook(pageImages);
  } catch (err) {
    console.error(err);
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (pageFlip) pageFlip.destroy();
  if (blobUrl) URL.revokeObjectURL(blobUrl);
});
</script>

<style scoped>
.book-viewer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  position: fixed;
  inset: 0;
  background: #2b2b2b;
  overflow: hidden;
}

.flip-container {
  width: 100%;
  max-width: 1000px;
  height: 100%;
  max-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.flip-container :deep(.stf__wrapper) {
  margin: 0 auto;
}

.page {
  background: white;
}

.page img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading {
  color: white;
  font-size: 18px;
}
</style>
