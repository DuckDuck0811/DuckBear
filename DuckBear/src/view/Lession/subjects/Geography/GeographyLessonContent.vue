<template>
  <!-- Môn Địa lí – Trang Atlas & Hồ sơ Địa chí Trực quan: Giấy bản đồ, đường đồng mức, thước tỉ lệ, hoa gió la bàn, toạ độ GPS, 4 gam màu Atlat -->
  <div class="geo-page" :class="`geo-font-${fontSize}`">
    <!-- ── Dải Banner Atlas Địa lí đầu trang ── -->
    <aside class="geo-atlas-banner" aria-label="Bảng chỉ dẫn Atlat Địa lí">
      <div class="geo-banner-top">
        <div class="geo-banner-brand">
          <div class="geo-globe-icon" aria-hidden="true">
            <v-icon icon="mdi-earth" size="26" />
          </div>
          <div class="geo-banner-text">
            <div class="geo-banner-tag">
              HỌC LIỆU ĐỊA LÍ · BẢN ĐỒ &amp; SỐ LIỆU ĐỊA CHÍ
            </div>
            <div class="geo-banner-title">
              Hệ thống Tri thức Địa lí Trực quan
            </div>
          </div>
        </div>

        <!-- Tọa độ định vị tham chiếu -->
        <div
          class="geo-graticule-badge"
          title="Tọa độ tham chiếu lãnh thổ Việt Nam"
        >
          <v-icon icon="mdi-crosshairs-gps" size="16" class="mr-1" />
          <span class="graticule-coords"
            >08°34′B – 23°23′B &bull; 102°09′Đ – 109°28′Đ</span
          >
        </div>
      </div>

      <!-- Thước đo tỉ lệ bản đồ + Chú giải màu sắc Atlat -->
      <div class="geo-banner-bottom">
        <div
          class="geo-scale-bar"
          title="Thước tỉ lệ đồ hoạ biểu trưng môn Địa lí"
        >
          <span class="scale-label">TỈ LỆ ĐỒ HOẠ:</span>
          <div class="scale-graphic">
            <span class="scale-tick">0</span>
            <div class="scale-segments">
              <span class="scale-seg scale-seg--solid"></span>
              <span class="scale-seg scale-seg--hollow"></span>
              <span class="scale-seg scale-seg--solid"></span>
              <span class="scale-seg scale-seg--hollow"></span>
            </div>
            <span class="scale-tick">50</span>
            <span class="scale-tick">100</span>
            <span class="scale-tick">250 km</span>
          </div>
        </div>

        <div class="geo-legend-tags">
          <span class="geo-legend-tag tag--sea">
            <span class="dot"></span> Biển &amp; Khí hậu
          </span>
          <span class="geo-legend-tag tag--land">
            <span class="dot"></span> Địa hình &amp; Khoáng sản
          </span>
          <span class="geo-legend-tag tag--forest">
            <span class="dot"></span> Sinh vật &amp; Đất đai
          </span>
          <span class="geo-legend-tag tag--pin">
            <span class="dot"></span> Tọa độ &amp; Dân cư
          </span>
        </div>
      </div>
    </aside>

    <!-- ── Danh sách các phần bài học ── -->
    <article
      v-for="(sec, secIdx) in viewSections"
      :key="secIdx"
      :id="`lesson-section-${secIdx}`"
      class="geo-section"
      :class="`geo-theme--${sec.topic.theme}`"
    >
      <!-- Dấu góc bản đồ định vị (Crosshair corner marks) -->
      <span class="corner-crosshair corner-tl" aria-hidden="true">+</span>
      <span class="corner-crosshair corner-tr" aria-hidden="true">+</span>
      <span class="corner-crosshair corner-bl" aria-hidden="true">+</span>
      <span class="corner-crosshair corner-br" aria-hidden="true">+</span>

      <!-- Tiêu đề phần: Đường đồng mức chìm + Huy hiệu la bàn + Thẻ chủ đề -->
      <header class="geo-section-head">
        <div class="geo-head-main">
          <span class="geo-section-badge" aria-hidden="true">
            <span class="geo-badge-order">PHẦN {{ secIdx + 1 }}</span>
            <span class="geo-badge-icon">
              <v-icon :icon="sec.topic.icon" size="20" />
            </span>
          </span>

          <div class="geo-title-wrapper">
            <div class="geo-topic-subtag">
              <v-icon
                :icon="getTopicIcon(sec.topic.key)"
                size="14"
                class="mr-1"
              />
              {{ getTopicLabel(sec.topic.key) }}
            </div>
            <h2 class="geo-section-title">
              <span class="geo-sr-only">Phần {{ secIdx + 1 }}: </span>
              {{ sec.cleanTitle || sec.title }}
            </h2>
          </div>
        </div>

        <div class="geo-head-meta">
          <span class="block-count-badge" v-if="sec.blocks.length">
            <v-icon icon="mdi-layers-outline" size="14" class="mr-1" />
            {{ sec.blocks.length }} nội dung
          </span>
        </div>
      </header>

      <!-- Thân nội dung phần học -->
      <div class="geo-body">
        <template v-for="(block, bIdx) in sec.blocks" :key="bIdx">
          <!-- 1. SỐ LIỆU ĐỊA LÍ: Thẻ chỉ số kèm biểu tượng đặc thù -->
          <div v-if="block.type === 'stats'" class="geo-stats-container">
            <div class="geo-block-label">
              <v-icon icon="mdi-chart-box-outline" size="16" class="mr-1" />
              Số liệu trọng tâm &amp; Chỉ số địa lí
            </div>
            <ul class="geo-stats">
              <li
                v-for="(s, i) in block.items"
                :key="i"
                class="geo-stat"
                :class="{ 'geo-stat--text': !s.value }"
              >
                <div class="geo-stat-head">
                  <span class="geo-stat-icon-wrap" aria-hidden="true">
                    <v-icon :icon="getStatIcon(s.label)" size="18" />
                  </span>
                  <span class="geo-stat-label">{{ s.label }}</span>
                </div>

                <div v-if="s.value" class="geo-stat-figure">
                  <small v-if="s.prefix" class="stat-prefix">{{
                    s.prefix
                  }}</small>
                  <b class="stat-val">{{ s.value }}</b>
                  <i v-if="s.unit" class="stat-unit">{{ s.unit }}</i>
                </div>
                <div v-else class="geo-stat-text">
                  {{ capitalizeFirstLetter(s.text) }}
                </div>

                <div v-if="s.note" class="geo-stat-note">
                  <v-icon
                    icon="mdi-information-outline"
                    size="13"
                    class="mr-1"
                  />
                  {{ capitalizeFirstLetter(s.note) }}
                </div>
                <div class="geo-stat-accent-bar" aria-hidden="true"></div>
              </li>
            </ul>
          </div>

          <!-- 2. ĐIỂM CỰC & TỌA ĐỘ: Cột mốc biên cương / Tọa độ GPS quốc gia -->
          <div
            v-else-if="block.type === 'extremes'"
            class="geo-extremes-container"
          >
            <div class="geo-block-label">
              <v-icon icon="mdi-map-marker-distance" size="16" class="mr-1" />
              Điểm cực lãnh thổ &amp; Tọa độ biên cương
            </div>
            <ul class="geo-extremes">
              <li v-for="(it, i) in block.items" :key="i" class="geo-extreme">
                <div class="geo-extreme-cap">
                  <span class="geo-extreme-compass-icon" aria-hidden="true">
                    <v-icon :icon="extremeIcon(it.key)" size="20" />
                  </span>
                  <div class="geo-extreme-heading">
                    <span class="extreme-dir-pill">{{
                      getExtremeCardinal(it.key)
                    }}</span>
                    <h3>{{ it.label }}</h3>
                  </div>
                </div>

                <div class="geo-extreme-content">
                  <div v-if="it.coord" class="geo-coord-badge">
                    <v-icon icon="mdi-crosshairs" size="15" class="mr-1" />
                    <span>{{ it.coord }}</span>
                  </div>
                  <div class="geo-extreme-place">
                    <v-icon
                      icon="mdi-map-marker"
                      size="16"
                      class="extreme-pin-icon"
                    />
                    <span>{{
                      capitalizeFirstLetter(it.coord ? it.place : it.text)
                    }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- 3. LA BÀN TIẾP GIÁP: Hoa tiêu la bàn phương vị & các hướng -->
          <div
            v-else-if="block.type === 'compass'"
            class="geo-compass-container"
          >
            <div class="geo-block-label">
              <v-icon icon="mdi-compass-outline" size="16" class="mr-1" />
              Phạm vi tiếp giáp &amp; Tứ cận lãnh thổ
            </div>
            <div class="geo-compass">
              <template v-for="cell in compassCells(block)" :key="cell.key">
                <!-- Tâm la bàn: Hoa gió hải đồ phương vị 360 độ -->
                <div
                  v-if="cell.key === 'c'"
                  class="geo-compass-center"
                  aria-hidden="true"
                >
                  <div class="rose-wrapper">
                    <svg viewBox="0 0 140 140" class="geo-rose">
                      <!-- Vòng tròn phương vị ngoài -->
                      <circle cx="70" cy="70" r="62" class="rose-ring" />
                      <circle
                        cx="70"
                        cy="70"
                        r="54"
                        class="rose-ring rose-ring--in"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="28"
                        class="rose-ring rose-ring--center"
                      />

                      <!-- Vạch chia độ 8 hướng -->
                      <line x1="70" y1="8" x2="70" y2="18" class="rose-tick" />
                      <line
                        x1="70"
                        y1="122"
                        x2="70"
                        y2="132"
                        class="rose-tick"
                      />
                      <line x1="8" y1="70" x2="18" y2="70" class="rose-tick" />
                      <line
                        x1="122"
                        y1="70"
                        x2="132"
                        y2="70"
                        class="rose-tick"
                      />

                      <!-- 4 cánh sao phụ Đông Bắc, Tây Bắc, Đông Nam, Tây Nam -->
                      <polygon
                        points="70,70 88,40 70,52 52,40"
                        class="rose-sub"
                      />
                      <polygon
                        points="70,70 88,100 70,88 52,100"
                        class="rose-sub"
                      />
                      <polygon
                        points="70,70 40,88 52,70 40,52"
                        class="rose-sub"
                      />
                      <polygon
                        points="70,70 100,88 88,70 100,52"
                        class="rose-sub"
                      />

                      <!-- 4 cánh sao chính Bắc - Nam - Đông - Tây -->
                      <polygon
                        points="70,12 79,70 70,61 61,70"
                        class="rose-n"
                      />
                      <polygon
                        points="70,128 61,70 70,79 79,70"
                        class="rose-s"
                      />
                      <polygon
                        points="12,70 70,61 61,70 70,79"
                        class="rose-w"
                      />
                      <polygon
                        points="128,70 70,79 79,70 70,61"
                        class="rose-e"
                      />

                      <!-- Tâm la bàn & Chữ BẮC -->
                      <circle cx="70" cy="70" r="6" class="rose-pivot" />
                      <text
                        x="70"
                        y="32"
                        text-anchor="middle"
                        class="rose-letter"
                      >
                        B
                      </text>
                      <text
                        x="70"
                        y="116"
                        text-anchor="middle"
                        class="rose-letter rose-letter--sub"
                      >
                        N
                      </text>
                      <text
                        x="115"
                        y="74"
                        text-anchor="middle"
                        class="rose-letter rose-letter--sub"
                      >
                        Đ
                      </text>
                      <text
                        x="25"
                        y="74"
                        text-anchor="middle"
                        class="rose-letter rose-letter--sub"
                      >
                        T
                      </text>
                    </svg>
                  </div>
                </div>

                <!-- Ô hướng tiếp giáp xung quanh -->
                <div
                  v-else
                  class="geo-compass-cell"
                  :class="[
                    `geo-compass-cell--${cell.key}`,
                    { 'geo-compass-cell--empty': !cell.item },
                  ]"
                >
                  <template v-if="cell.item">
                    <div class="compass-cell-header">
                      <span class="compass-dir-pill">{{
                        getDirectionBadge(cell.key).label
                      }}</span>
                      <v-icon
                        :icon="getDirectionBadge(cell.key).icon"
                        size="16"
                        class="compass-cell-icon"
                      />
                    </div>
                    <h3>{{ cell.item.label }}</h3>
                    <p>{{ capitalizeFirstLetter(cell.item.text) }}</p>
                  </template>
                </div>
              </template>
            </div>
          </div>

          <!-- 4. THUẬN LỢI & KHÓ KHĂN: Tiềm năng phát triển vs Thách thức thiên tai -->
          <div
            v-else-if="block.type === 'pros-cons'"
            class="geo-proscons-wrapper"
          >
            <div class="geo-block-label">
              <v-icon icon="mdi-scale-balance" size="16" class="mr-1" />
              Đánh giá Địa lí: Thuận lợi &amp; Thách thức
            </div>
            <div
              class="geo-proscons"
              :class="{
                'is-single': !(block.pros.length && block.cons.length),
              }"
            >
              <section v-if="block.pros.length" class="geo-pc geo-pc--pro">
                <header class="pc-head">
                  <span class="pc-badge-icon">
                    <v-icon icon="mdi-check-decagram-outline" size="20" />
                  </span>
                  <div>
                    <span class="pc-eyebrow">TIỀM NĂNG TỰ NHIÊN</span>
                    <h3>{{ block.prosLabel || "Thuận lợi & Thế mạnh" }}</h3>
                  </div>
                </header>
                <ul>
                  <li v-for="(it, i) in block.pros" :key="i">
                    <span class="pc-bullet-icon">
                      <v-icon icon="mdi-check" size="14" />
                    </span>
                    <span>{{ capitalizeFirstLetter(it) }}</span>
                  </li>
                </ul>
              </section>

              <section v-if="block.cons.length" class="geo-pc geo-pc--con">
                <header class="pc-head">
                  <span class="pc-badge-icon">
                    <v-icon icon="mdi-alert-octagon-outline" size="20" />
                  </span>
                  <div>
                    <span class="pc-eyebrow">KHÓ KHĂN &amp; THIÊN TAI</span>
                    <h3>{{ block.consLabel || "Khó khăn & Hạn chế" }}</h3>
                  </div>
                </header>
                <ul>
                  <li v-for="(it, i) in block.cons" :key="i">
                    <span class="pc-bullet-icon">
                      <v-icon icon="mdi-alert-circle-outline" size="14" />
                    </span>
                    <span>{{ capitalizeFirstLetter(it) }}</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <!-- 5. NGUYÊN NHÂN → HẬU QUẢ → GIẢI PHÁP: Lưu đồ Địa lí tuần hoàn -->
          <div v-else-if="block.type === 'causal'" class="geo-causal-wrapper">
            <div class="geo-block-label">
              <v-icon
                icon="mdi-arrow-decision-outline"
                size="16"
                class="mr-1"
              />
              Mối quan hệ Địa lí: Nguyên nhân &ndash; Tác động &ndash; Giải pháp
            </div>
            <ol class="geo-causal">
              <li
                v-for="(st, i) in block.steps"
                :key="i"
                class="geo-causal-step"
                :class="`geo-causal--${st.kind}`"
              >
                <div class="causal-step-head">
                  <span class="causal-step-no">{{ i + 1 }}</span>
                  <span class="causal-step-icon">
                    <v-icon :icon="getCausalIcon(st.kind)" size="18" />
                  </span>
                  <h3>{{ st.label }}</h3>
                </div>
                <ul>
                  <li v-for="(it, k) in st.items" :key="k">
                    {{ capitalizeFirstLetter(it) }}
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          <!-- 6. CÁC VÙNG / TIỂU VÙNG ĐỊA LÍ: Thẻ phân vùng lãnh thổ -->
          <div v-else-if="block.type === 'regions'" class="geo-regions-wrapper">
            <div class="geo-block-label">
              <v-icon icon="mdi-map-marker-path" size="16" class="mr-1" />
              Phân vùng Lãnh thổ &amp; Đặc trưng Khu vực
            </div>
            <ul class="geo-regions">
              <li v-for="(it, i) in block.items" :key="i">
                <header class="region-card-head">
                  <v-icon icon="mdi-map-outline" size="20" class="mr-2" />
                  <h3>{{ it.label }}</h3>
                </header>
                <p>{{ capitalizeFirstLetter(it.text) }}</p>
              </li>
            </ul>
          </div>

          <!-- 7. BẢNG SỐ LIỆU ĐỊA LÍ: Chuẩn Niên giám thống kê -->
          <div v-else-if="block.type === 'table'" class="geo-grid-container">
            <div class="geo-block-label">
              <v-icon icon="mdi-table" size="16" class="mr-1" />
              Bảng số liệu &amp; Niên giám thống kê Địa lí
            </div>
            <div class="geo-grid-wrap">
              <table class="geo-grid">
                <thead>
                  <tr>
                    <th v-for="(h, i) in block.headers" :key="i" scope="col">
                      {{ h }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in block.rows" :key="r">
                    <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 8. KHÁI NIỆM & THUẬT NGỮ ĐỊA LÍ -->
          <aside v-else-if="block.type === 'concept'" class="geo-concept">
            <div class="geo-concept-head">
              <v-icon icon="mdi-bookmark-outline" size="18" class="mr-1" />
              <strong class="geo-concept-label">{{ block.label }}</strong>
            </div>
            <p>{{ capitalizeFirstLetter(block.text) }}</p>
          </aside>

          <!-- 9. GHI CHÚ / KĨ NĂNG ATLAT: Sổ tay thực địa & Tra cứu bản đồ -->
          <aside
            v-else-if="block.type === 'note'"
            class="geo-note"
            :class="`geo-note--${block.tone}`"
          >
            <span class="geo-note-glyph" aria-hidden="true">
              <v-icon
                :icon="block.icon || 'mdi-map-search-outline'"
                size="22"
              />
            </span>
            <div class="geo-note-body">
              <div class="geo-note-badge">
                <v-icon icon="mdi-book-search-outline" size="13" class="mr-1" />
                KĨ NĂNG &amp; LƯU Ý ATLAT
              </div>
              <p>
                <strong>{{ capitalizeFirstLetter(block.title) }}.</strong>
                {{ capitalizeFirstLetter(block.desc) }}
              </p>
            </div>
          </aside>

          <!-- 10. VÍ DỤ MINH HỌA -->
          <section v-else-if="block.type === 'example'" class="geo-example">
            <header class="example-head">
              <v-icon icon="mdi-map-search-outline" size="19" class="mr-1" />
              <h3>{{ block.badgeTitle || "Ví dụ thực tế" }}</h3>
            </header>
            <p>{{ capitalizeFirstLetter(block.problemText) }}</p>
          </section>

          <!-- 11. BÀI TẬP / CÂU HỎI VẬN DỤNG -->
          <section v-else-if="block.type === 'exercise'" class="geo-exercise">
            <header class="exercise-head">
              <v-icon icon="mdi-pencil-ruler" size="19" class="mr-1" />
              <h3>{{ block.title || "Bài tập rèn luyện kĩ năng" }}</h3>
            </header>
            <ol>
              <li v-for="(it, i) in block.items" :key="i">
                {{ capitalizeFirstLetter(it) }}
              </li>
            </ol>
            <details v-if="block.answers" class="geo-details">
              <summary>
                <v-icon
                  icon="mdi-lightbulb-on-outline"
                  size="16"
                  class="mr-1"
                />
                Xem hướng dẫn giải &amp; gợi ý
              </summary>
              <div class="geo-details-content">
                <p>{{ capitalizeFirstLetter(block.answers) }}</p>
              </div>
            </details>
          </section>
          <!-- YÊU CẦU CẦN ĐẠT / MỤC TIÊU BÀI HỌC -->
          <section v-else-if="block.type === 'goal'" class="geo-goal-card">
            <header class="goal-card-head">
              <div class="goal-icon-wrap" aria-hidden="true">
                <v-icon icon="mdi-bullseye-arrow" size="20" />
              </div>
              <div>
                <span class="goal-eyebrow">CHUẨN ĐẦU RA</span>
                <h3>{{ block.title || "Yêu cầu cần đạt" }}</h3>
              </div>
            </header>
            <ul class="goal-list">
              <li v-for="(it, i) in block.items" :key="i">
                <span class="goal-check-bullet" aria-hidden="true">
                  <v-icon icon="mdi-check-circle" size="16" />
                </span>
                <span>{{ capitalizeFirstLetter(it) }}</span>
              </li>
            </ul>
          </section>

          <!-- 12. NHÃN ĐƠN LẺ -->
          <div v-else-if="block.type === 'labeled'" class="geo-labeled">
            <span class="geo-labeled-term">
              <v-icon icon="mdi-tag-outline" size="14" class="mr-1" />
              {{ block.label }}
            </span>
            <p>{{ capitalizeFirstLetter(block.text) }}</p>
          </div>

          <!-- 13. DANH SÁCH THÔNG SỐ / ĐẶC ĐIỂM -->
          <dl v-else-if="block.type === 'labeled-list'" class="geo-facts">
            <div v-for="(it, i) in block.items" :key="i" class="geo-fact">
              <dt>
                <v-icon icon="mdi-circle-small" size="18" class="mr-1" />
                {{ it.label }}
              </dt>
              <dd>{{ capitalizeFirstLetter(it.text) }}</dd>
            </div>
          </dl>

          <!-- 14. DANH SÁCH Ý -->
          <ul v-else-if="block.type === 'list'" class="geo-list">
            <li v-for="(item, i) in block.items" :key="i">
              <span class="geo-list-marker" aria-hidden="true">
                {{ item.number ? `${item.number}.` : "•" }}
              </span>
              <span>{{ capitalizeFirstLetter(item.text) }}</span>
            </li>
          </ul>

          <!-- 15. ĐOẠN VĂN TIÊU CHUẨN -->
          <p v-else class="geo-para">{{ capitalizeFirstLetter(block.text) }}</p>
        </template>
      </div>
    </article>

    <!-- ── TỔNG KẾT & GHI NHỚ TRỌNG TÂM CỦA BÀI ── -->
    <section v-if="extractedTips.length" class="geo-recap">
      <header class="geo-recap-header">
        <div class="geo-recap-icon-box" aria-hidden="true">
          <v-icon icon="mdi-map-marker-star-outline" size="24" />
        </div>
        <div>
          <span class="geo-recap-eyebrow">HỒ SƠ TỔNG KẾT</span>
          <h3 class="geo-recap-title">Ghi nhớ &amp; Lưu ý Địa lí của bài</h3>
        </div>
      </header>

      <ul class="geo-recap-grid">
        <li
          v-for="(tip, tIdx) in extractedTips"
          :key="tIdx"
          class="geo-recap-item"
          :class="`geo-tone--${tip.color}`"
        >
          <span class="geo-recap-icon" aria-hidden="true">
            <v-icon :icon="tip.icon" size="20" />
          </span>
          <div class="geo-recap-text">
            <h4>{{ tip.title }}</h4>
            <p>{{ capitalizeFirstLetter(tip.desc) }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── TỰ KIỂM TRA NHANH: Trắc nghiệm / Giải đố Atlat ── -->
    <section v-if="checkQuestions.length" class="geo-check">
      <header class="geo-check-head">
        <span class="geo-check-icon" aria-hidden="true">
          <v-icon icon="mdi-compass-outline" size="24" />
        </span>
        <div>
          <span class="geo-check-eyebrow">ÔN TẬP NHANH</span>
          <h3>Thử thách Tri thức Địa lí</h3>
          <p>
            Câu hỏi tự kiểm tra trích xuất trực tiếp từ số liệu, tọa độ và nội
            dung bài học
          </p>
        </div>
      </header>

      <ol class="geo-check-list">
        <li v-for="(q, i) in checkQuestions" :key="i" class="geo-check-item">
          <div class="geo-check-q">
            <span class="geo-check-no">{{ i + 1 }}</span>
            <p>{{ q.prompt }}</p>
          </div>
          <button
            type="button"
            class="geo-check-toggle"
            :aria-expanded="revealed.includes(i)"
            @click="toggleReveal(i)"
          >
            <v-icon
              :icon="
                revealed.includes(i) ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              size="17"
              class="mr-1"
            />
            {{ revealed.includes(i) ? "Ẩn đáp án" : "Xem đáp án" }}
          </button>
          <div v-if="revealed.includes(i)" class="geo-check-answer">
            <div class="geo-check-source">
              <v-icon icon="mdi-source-branch" size="14" class="mr-1" />
              Trích xuất từ phần: “{{ q.source }}”
            </div>
            <p>{{ capitalizeFirstLetter(q.answer) }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
/**
 * GeographyLessonContent.vue
 * Giao diện học liệu môn Địa lí – Chuẩn phong cách Atlas & Hồ sơ Địa chí:
 *   - Bản sắc: Thước tỉ lệ bản đồ, kinh vĩ tuyến (graticule), hoa gió la bàn 8 hướng,
 *     cột mốc tọa độ GPS/biên cương, thẻ số liệu địa lý kèm icon sinh động,
 *     4 gam màu Atlat chuẩn (Hải dương, Địa hình, Rừng xanh, Mốc chủ quyền).
 *   - Parser tích hợp từ Geographyparser.js.
 */
import { computed, ref } from "vue";
import {
  parseGeographySections,
  extractGeographyTips,
} from "./Geographyparser";

const props = defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});

function capitalizeFirstLetter(text) {
  return String(text ?? "").replace(
    /^([^\p{L}\d]*)(\p{L})/u,
    (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("vi")}`,
  );
}

/* ── Nhận diện Icon số liệu địa lí thông minh ── */
function getStatIcon(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("diện tích") || l.includes("lãnh thổ") || l.includes("đất"))
    return "mdi-texture-box";
  if (l.includes("bờ biển") || l.includes("biển") || l.includes("hải"))
    return "mdi-waves";
  if (
    l.includes("biên giới") ||
    l.includes("đường biên") ||
    l.includes("chiều dài")
  )
    return "mdi-vector-polyline";
  if (l.includes("nhiệt độ") || l.includes("nóng") || l.includes("lạnh"))
    return "mdi-thermometer";
  if (l.includes("mưa") || l.includes("lượng mưa") || l.includes("ẩm"))
    return "mdi-weather-pouring";
  if (
    l.includes("núi") ||
    l.includes("độ cao") ||
    l.includes("đỉnh") ||
    l.includes("địa hình")
  )
    return "mdi-image-filter-hdr";
  if (
    l.includes("dân số") ||
    l.includes("người") ||
    l.includes("dân tộc") ||
    l.includes("mật độ")
  )
    return "mdi-account-group";
  if (l.includes("rừng") || l.includes("độ che phủ") || l.includes("cây"))
    return "mdi-pine-tree";
  if (l.includes("đảo") || l.includes("quần đảo")) return "mdi-island";
  if (l.includes("sông") || l.includes("hồ") || l.includes("lưu lượng"))
    return "mdi-water";
  if (l.includes("tỉ lệ") || l.includes("%") || l.includes("chiếm"))
    return "mdi-chart-arc";
  return "mdi-numeric";
}

/* ── Nhận diện Chủ đề & Icon phân mục ── */
function getTopicIcon(key) {
  const map = {
    location: "mdi-map-marker-radius-outline",
    climate: "mdi-weather-partly-rainy",
    water: "mdi-waves",
    sea: "mdi-sail-boat",
    terrain: "mdi-terrain",
    resources: "mdi-diamond-stone",
    bio: "mdi-pine-tree",
    environment: "mdi-leaf",
    population: "mdi-account-group-outline",
    urban: "mdi-city-variant-outline",
    agri: "mdi-sprout-outline",
    industry: "mdi-factory",
    service: "mdi-truck-delivery-outline",
    region: "mdi-map-outline",
    summary: "mdi-bookmark-check-outline",
  };
  return map[key] || "mdi-earth";
}

function getTopicLabel(key) {
  const map = {
    location: "VỊ TRÍ & PHẠM VI",
    climate: "KHÍ HẬU & THỜI TIẾT",
    water: "THUỶ VĂN & SÔNG NGÒI",
    sea: "BIỂN ĐẢO VIỆT NAM",
    terrain: "ĐỊA HÌNH & ĐỊA CHẤT",
    resources: "KHOÁNG SẢN & TÀI NGUYÊN",
    bio: "SINH VẬT & THỔ NHƯỠNG",
    environment: "MÔI TRƯỜNG & THIÊN TAI",
    population: "DÂN CƯ & DÂN TỘC",
    urban: "ĐÔ THỊ & PHÂN BỐ",
    agri: "NÔNG & LÂM & THỦY SẢN",
    industry: "CÔNG NGHIỆP & XÂY DỰNG",
    service: "DỊCH VỤ & GIAO THÔNG",
    region: "PHÂN VÙNG KINH TẾ",
    summary: "TỔNG KẾT ĐỊA CHÍ",
  };
  return map[key] || "ĐỊA LÍ TỰ NHIÊN";
}

/* ── Nhãn & Icon phương hướng La bàn ── */
function getDirectionBadge(key) {
  const map = {
    n: { label: "HƯỚNG BẮC (N)", icon: "mdi-arrow-up-thick" },
    s: { label: "HƯỚNG NAM (S)", icon: "mdi-arrow-down-thick" },
    e: { label: "HƯỚNG ĐÔNG (E)", icon: "mdi-arrow-right-thick" },
    w: { label: "HƯỚNG TÂY (W)", icon: "mdi-arrow-left-thick" },
    ne: { label: "HƯỚNG ĐÔNG BẮC (NE)", icon: "mdi-arrow-top-right-thick" },
    nw: { label: "HƯỚNG TÂY BẮC (NW)", icon: "mdi-arrow-top-left-thick" },
    se: { label: "HƯỚNG ĐÔNG NAM (SE)", icon: "mdi-arrow-bottom-right-thick" },
    sw: { label: "HƯỚNG TÂY NAM (SW)", icon: "mdi-arrow-bottom-left-thick" },
  };
  return map[key] || { label: "PHƯƠNG HƯỚNG", icon: "mdi-compass-outline" };
}

/* ── Nhãn Điểm Cực Lãnh Thổ ── */
function getExtremeCardinal(key) {
  const map = {
    n: "NORTH · CỰC BẮC",
    s: "SOUTH · CỰC NAM",
    e: "EAST · CỰC ĐÔNG",
    w: "WEST · CỰC TÂY",
  };
  return map[key] || "BORDER POINT";
}

function getCausalIcon(kind) {
  const map = {
    cause: "mdi-source-branch",
    effect: "mdi-alert-circle-outline",
    solution: "mdi-shield-check-outline",
  };
  return map[kind] || "mdi-circle-medium";
}

const COMPASS_ORDER = ["nw", "n", "ne", "w", "c", "e", "sw", "s", "se"];
const compassCells = (block) =>
  COMPASS_ORDER.map((key) => ({
    key,
    item: block.items.find((i) => i.key === key) || null,
  }));

const extremeIcon = (key) =>
  ({
    n: "mdi-arrow-up-circle",
    s: "mdi-arrow-down-circle",
    e: "mdi-arrow-right-circle",
    w: "mdi-arrow-left-circle",
  })[key] || "mdi-compass-rose";

const parsedSections = computed(() =>
  parseGeographySections(props.lesson?.content),
);
const extractedTips = computed(() =>
  extractGeographyTips(props.lesson?.content),
);

// Phần "vùng / khu vực": các dòng "Tên vùng: mô tả" hiển thị dạng thẻ vùng
const viewSections = computed(() =>
  parsedSections.value
    .map((sec) => ({
      ...sec,
      blocks: sec.blocks.map((b) => {
        if (b.type === "labeled-list" && b.items.length === 1)
          return {
            type: "labeled",
            label: b.items[0].label,
            text: b.items[0].text,
          };
        if (
          b.type === "labeled-list" &&
          sec.topic.key === "region" &&
          b.items.length >= 2
        )
          return { type: "regions", items: b.items };
        return b;
      }),
    }))
    // Bỏ các phần rỗng
    .filter((sec) => sec.blocks.length > 0),
);

/* ── Tự kiểm tra: lấy câu hỏi từ chính dữ liệu của bài ── */
const revealed = ref([]);
const toggleReveal = (i) => {
  revealed.value = revealed.value.includes(i)
    ? revealed.value.filter((x) => x !== i)
    : [...revealed.value, i];
};

const checkQuestions = computed(() => {
  const pool = { stats: [], extremes: [], compass: [], pc: [], causal: [] };

  for (const sec of parsedSections.value) {
    const source = sec.cleanTitle || sec.title;
    for (const b of sec.blocks) {
      if (b.type === "stats") {
        b.items
          .filter((i) => i.value)
          .slice(0, 2)
          .forEach((i) =>
            pool.stats.push({
              prompt: `Số liệu “${i.label}” được nêu trong bài là bao nhiêu?`,
              answer: i.text,
              source,
            }),
          );
      } else if (b.type === "extremes") {
        b.items.slice(0, 2).forEach((i) =>
          pool.extremes.push({
            prompt: `${capitalizeFirstLetter(i.label)} của lãnh thổ nằm ở đâu, tọa độ bao nhiêu?`,
            answer: i.text,
            source,
          }),
        );
      } else if (b.type === "compass") {
        pool.compass.push({
          prompt: "Lãnh thổ tiếp giáp với những đâu theo từng hướng?",
          answer: b.items.map((i) => `${i.label}: ${i.text}`).join("; "),
          source,
        });
      } else if (b.type === "pros-cons") {
        if (b.pros.length)
          pool.pc.push({
            prompt: `Bài học nêu những ${b.prosLabel.toLocaleLowerCase("vi")} nào?`,
            answer: b.pros.join("; "),
            source,
          });
        if (b.cons.length)
          pool.pc.push({
            prompt: `Bài học nêu những ${b.consLabel.toLocaleLowerCase("vi")} nào?`,
            answer: b.cons.join("; "),
            source,
          });
      } else if (b.type === "causal") {
        pool.causal.push({
          prompt: `Trình bày ${b.steps.map((s) => s.label.toLocaleLowerCase("vi")).join(", ")} được nêu trong bài.`,
          answer: b.steps
            .map((s) => `${s.label}: ${s.items.join("; ")}`)
            .join(" • "),
          source,
        });
      }
    }
  }

  // Xen kẽ các loại câu hỏi, tối đa 4 câu
  const order = ["stats", "extremes", "compass", "pc", "causal"];
  const result = [];
  for (let round = 0; result.length < 4; round += 1) {
    let added = false;
    for (const k of order) {
      const q = pool[k][round];
      if (q && result.length < 4) {
        result.push(q);
        added = true;
      }
    }
    if (!added) break;
  }
  return result;
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Serif:ital,wght@0,500;0,600;0,700;1,500&display=swap");

/* ════════════════════════════════════════════════════════════════════
   TOKENS ĐẶC TRƯNG MÔN ĐỊA LÍ:
   - Giấy bản đồ, lưới toạ độ kinh vĩ tuyến
   - 4 gam màu Atlat chuẩn:
     * Hải dương (Ocean Blue)
     * Đất bazan / Địa hình (Terrain Earth)
     * Rừng sinh thái (Forest Green)
     * Cột mốc biên cương (Crimson Pin)
   ════════════════════════════════════════════════════════════════════ */
.geo-page {
  --paper: #ffffff;
  --sheet: #fbf9f4;
  --sheet-alt: #f3efe6;
  --ink: #112328;
  --ink-2: #34484f;
  --ink-3: #63757d;
  --rule: #dbe3de;
  --rule-2: #ebf0ec;

  /* 4 gam màu bản đồ học */
  --sea: #0284c7;
  --sea-deep: #0369a1;
  --sea-soft: #f0f9ff;
  --sea-bd: #bae6fd;

  --land: #b45309;
  --land-deep: #92400e;
  --land-soft: #fffbeb;
  --land-bd: #fde68a;

  --forest: #15803d;
  --forest-deep: #166534;
  --forest-soft: #f0fdf4;
  --forest-bd: #bbf7d0;

  --pin: #dc2626;
  --pin-deep: #b91c1c;
  --pin-soft: #fef2f2;
  --pin-bd: #fecaca;

  --display: "Noto Serif", Georgia, "Times New Roman", serif;
  --sans: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
  --base: 16px;

  font-family: var(--sans);
  font-size: var(--base);
  line-height: 1.75;
  color: var(--ink);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.geo-font-small {
  --base: 14.5px;
}
.geo-font-normal {
  --base: 16px;
}
.geo-font-large {
  --base: 18.5px;
}

/* Themes theo màu phần học */
.geo-theme--sea {
  --t: var(--sea);
  --t-deep: var(--sea-deep);
  --t-soft: var(--sea-soft);
  --t-bd: var(--sea-bd);
}
.geo-theme--land {
  --t: var(--land);
  --t-deep: var(--land-deep);
  --t-soft: var(--land-soft);
  --t-bd: var(--land-bd);
}
.geo-theme--forest {
  --t: var(--forest);
  --t-deep: var(--forest-deep);
  --t-soft: var(--forest-soft);
  --t-bd: var(--forest-bd);
}
.geo-theme--pin {
  --t: var(--pin);
  --t-deep: var(--pin-deep);
  --t-soft: var(--pin-soft);
  --t-bd: var(--pin-bd);
}

.geo-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* ════════════════════════════════════════════════════════════════════
   DẢI BANNER ATLAT ĐẦU TRANG (ATLAS EXPLORER BANNER)
   ════════════════════════════════════════════════════════════════════ */
.geo-atlas-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0369a1 100%);
  color: #ffffff;
  border-radius: 14px;
  padding: 1.4rem 1.8rem;
  margin-bottom: 1.6rem;
  box-shadow:
    0 10px 25px -5px rgba(15, 23, 42, 0.15),
    0 8px 10px -6px rgba(15, 23, 42, 0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.geo-atlas-banner::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(56, 189, 248, 0.18) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.geo-banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.geo-banner-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.geo-globe-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.geo-banner-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7dd3fc;
  text-transform: uppercase;
}

.geo-banner-title {
  font-family: var(--display);
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.geo-graticule-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 0.4rem 0.85rem;
  border-radius: 30px;
  font-size: 0.82rem;
  color: #e0f2fe;
  font-family: var(--sans);
  font-variant-numeric: tabular-nums;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.geo-banner-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding-top: 1rem;
}

/* Thước đo tỉ lệ bản đồ */
.geo-scale-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.scale-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.scale-graphic {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.scale-segments {
  display: inline-flex;
  height: 6px;
  width: 140px;
  border: 1px solid #ffffff;
  border-radius: 2px;
  overflow: hidden;
}

.scale-seg {
  flex: 1;
}

.scale-seg--solid {
  background-color: #ffffff;
}

.scale-seg--hollow {
  background-color: transparent;
}

.geo-legend-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.geo-legend-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #e2e8f0;
}

.geo-legend-tag .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.geo-legend-tag.tag--sea .dot {
  background-color: #38bdf8;
}
.geo-legend-tag.tag--land .dot {
  background-color: #fbbf24;
}
.geo-legend-tag.tag--forest .dot {
  background-color: #4ade80;
}
.geo-legend-tag.tag--pin .dot {
  background-color: #f87171;
}

/* ════════════════════════════════════════════════════════════════════
   CÁC PHẦN HỌC BẢN ĐỒ (ATLAS SECTION CARDS)
   ════════════════════════════════════════════════════════════════════ */
.geo-section {
  position: relative;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.geo-section + .geo-section {
  margin-top: 1.8rem;
}

/* Dấu chữ thập định vị góc bản đồ (+ ticks) */
.corner-crosshair {
  position: absolute;
  font-family: monospace;
  font-size: 15px;
  font-weight: 700;
  color: var(--t);
  opacity: 0.45;
  line-height: 1;
  pointer-events: none;
  z-index: 2;
}

.corner-tl {
  top: 6px;
  left: 8px;
}
.corner-tr {
  top: 6px;
  right: 8px;
}
.corner-bl {
  bottom: 6px;
  left: 8px;
}
.corner-br {
  bottom: 6px;
  right: 8px;
}

/* Header của từng phần: Giấy bản đồ ngà + Đường đồng mức mờ nghệ thuật */
.geo-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.25rem 1.8rem;
  background-color: var(--sheet);
  background-image:
    radial-gradient(
      ellipse at 85% 50%,
      rgba(0, 0, 0, 0.02) 0%,
      transparent 60%
    ),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='100' viewBox='0 0 420 100'%3E%3Cg fill='none' stroke='%230284c7' stroke-opacity='.12' stroke-width='1.2'%3E%3Cpath d='M210 12c50-10 100 8 120 35s-12 50-65 50-120 2-140-27 35-50 85-58z'/%3E%3Cpath d='M215 28c38-6 72 7 85 27s-10 35-48 35-88 1-100-20 25-37 63-42z'/%3E%3Cpath d='M222 45c25-4 45 5 50 17s-8 20-30 20-55 0-60-12 15-21 40-25z'/%3E%3Cpath d='M230 60c12-2 22 2 25 8s-4 10-15 10-28 0-30-6 8-10 20-12z'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.5rem center;
  background-size: auto 90%;
  border-bottom: 1px solid var(--rule);
  border-left: 6px solid var(--t);
}

.geo-head-main {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.geo-section-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background: var(--paper);
  border: 1.5px solid var(--t);
  color: var(--t);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.geo-badge-order {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--t);
  line-height: 1;
  margin-bottom: 2px;
}

.geo-topic-subtag {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--t);
  margin-bottom: 0.2rem;
}

.geo-section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.45rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.block-count-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-2);
}

.geo-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.8rem;
}

/* Nhãn tiêu đề khối nhỏ */
.geo-block-label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-2);
  margin-bottom: 0.8rem;
}

/* ════════════════════════════════════════════════════════════════════
   1. SỐ LIỆU ĐỊA LÍ (GEOGRAPHY METRICS & STATS)
   ════════════════════════════════════════════════════════════════════ */
.geo-stats-container {
  margin: 0.2rem 0;
}

.geo-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14.5rem, 1fr));
  gap: 1rem;
}

.geo-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.1rem 1.25rem 1.2rem;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.geo-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
}

.geo-stat-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.geo-stat-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--paper);
  border: 1px solid var(--t-bd);
  color: var(--t);
  flex-shrink: 0;
}

.geo-stat-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--ink-2);
  line-height: 1.35;
}

.geo-stat-figure {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.35rem 0 0.25rem;
}

.stat-prefix {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ink-3);
}

.stat-val {
  font-family: var(--display);
  font-weight: 800;
  font-size: 2rem;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-unit {
  font-style: normal;
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink-2);
}

.geo-stat-text {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--ink);
  line-height: 1.45;
  margin: 0.3rem 0;
}

.geo-stat-note {
  font-size: 0.82rem;
  color: var(--ink-3);
  margin-top: 0.4rem;
  line-height: 1.4;
  display: flex;
  align-items: center;
}

.geo-stat-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.5px;
  background: linear-gradient(90deg, var(--t) 0%, transparent 100%);
}

/* ════════════════════════════════════════════════════════════════════
   2. ĐIỂM CỰC & TỌA ĐỘ LÃNH THỔ (EXTREMES & COORDINATES)
   ════════════════════════════════════════════════════════════════════ */
.geo-extremes-container {
  margin: 0.3rem 0;
}

.geo-extremes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.geo-extreme {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: linear-gradient(180deg, var(--paper) 0%, var(--sheet) 100%);
  border-top: 3.5px solid var(--t);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
}

.geo-extreme-cap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.geo-extreme-compass-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--t);
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.extreme-dir-pill {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--t);
  text-transform: uppercase;
}

.geo-extreme h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink);
}

.geo-coord-badge {
  display: inline-flex;
  align-items: center;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  color: var(--t);
  font-weight: 800;
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  margin-bottom: 0.45rem;
}

.geo-extreme-place {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.92rem;
  color: var(--ink-2);
  line-height: 1.5;
  font-weight: 500;
}

.extreme-pin-icon {
  color: var(--pin);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ════════════════════════════════════════════════════════════════════
   3. LA BÀN TIẾP GIÁP (COMPASS ROSE & BORDERS)
   ════════════════════════════════════════════════════════════════════ */
.geo-compass-container {
  margin: 0.3rem 0;
}

.geo-compass {
  display: grid;
  grid-template-columns: 1fr minmax(10rem, 12rem) 1fr;
  grid-template-rows: auto auto auto;
  gap: 0.85rem 1.1rem;
  align-items: center;
  padding: 1.6rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 14px;
}

.geo-compass-cell {
  padding: 0.9rem 1.1rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--t);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}

.geo-compass-cell--empty {
  visibility: hidden;
  border: 0;
  background: none;
}

.compass-cell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.compass-dir-pill {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--t);
}

.compass-cell-icon {
  color: var(--t);
}

.geo-compass-cell h3 {
  margin: 0 0 0.2rem;
  font-family: var(--display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
}

.geo-compass-cell p {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.55;
  color: var(--ink-2);
}

.geo-compass-cell--n {
  text-align: center;
  border-left-width: 1px;
  border-top: 4px solid var(--pin);
}
.geo-compass-cell--s {
  text-align: center;
  border-left-width: 1px;
  border-bottom: 4px solid var(--sea);
}
.geo-compass-cell--w {
  text-align: right;
  border-left-width: 1px;
  border-right: 4px solid var(--land);
}
.geo-compass-cell--e {
  border-left: 4px solid var(--sea);
}

.geo-compass-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.rose-wrapper {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.1));
}

.geo-rose {
  width: 100%;
  max-width: 10.5rem;
  height: auto;
}

.rose-ring {
  fill: none;
  stroke: var(--ink-2);
  stroke-opacity: 0.4;
  stroke-width: 1.2;
}

.rose-ring--in {
  stroke-dasharray: 2 3;
}

.rose-ring--center {
  stroke: var(--t);
  stroke-opacity: 0.3;
}

.rose-tick {
  stroke: var(--ink);
  stroke-width: 2;
}

.rose-sub {
  fill: var(--ink-3);
  fill-opacity: 0.45;
}

.rose-n {
  fill: var(--pin);
}

.rose-s {
  fill: var(--sea);
}

.rose-w {
  fill: var(--land);
}

.rose-e {
  fill: var(--sea);
}

.rose-pivot {
  fill: #ffffff;
  stroke: var(--ink);
  stroke-width: 2;
}

.rose-letter {
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 800;
  fill: var(--pin);
}

.rose-letter--sub {
  font-size: 11px;
  fill: var(--ink-2);
}

/* ════════════════════════════════════════════════════════════════════
   4. THUẬN LỢI & KHÓ KHĂN (PROS & CONS)
   ════════════════════════════════════════════════════════════════════ */
.geo-proscons-wrapper {
  margin: 0.3rem 0;
}

.geo-proscons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.geo-proscons.is-single {
  grid-template-columns: 1fr;
}

.geo-pc {
  padding: 1.25rem 1.45rem;
  border-radius: 12px;
  border: 1px solid transparent;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.02);
}

.geo-pc--pro {
  background: var(--forest-soft);
  border-color: var(--forest-bd);
  border-top: 4px solid var(--forest);
}

.geo-pc--con {
  background: var(--pin-soft);
  border-color: var(--pin-bd);
  border-top: 4px solid var(--pin);
}

.pc-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.pc-badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--paper);
}

.geo-pc--pro .pc-badge-icon {
  color: var(--forest);
  border: 1px solid var(--forest-bd);
}

.geo-pc--con .pc-badge-icon {
  color: var(--pin);
  border: 1px solid var(--pin-bd);
}

.pc-eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  display: block;
  line-height: 1;
  margin-bottom: 3px;
}

.geo-pc--pro .pc-eyebrow {
  color: var(--forest);
}
.geo-pc--con .pc-eyebrow {
  color: var(--pin);
}

.geo-pc h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--ink);
}

.geo-pc ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.geo-pc li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.pc-bullet-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}

.geo-pc--pro .pc-bullet-icon {
  background: var(--forest);
  color: #ffffff;
}

.geo-pc--con .pc-bullet-icon {
  background: var(--pin);
  color: #ffffff;
}

/* ════════════════════════════════════════════════════════════════════
   5. NGUYÊN NHÂN → HẬU QUẢ → GIẢI PHÁP (CAUSAL FLOW)
   ════════════════════════════════════════════════════════════════════ */
.geo-causal-wrapper {
  margin: 0.3rem 0;
}

.geo-causal {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 2rem;
}

.geo-causal-step {
  position: relative;
  padding: 1.2rem 1.35rem;
  border: 1px solid var(--rule);
  border-top: 4px solid var(--ink-3);
  border-radius: 12px;
  background: var(--paper);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
}

.geo-causal-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -1.35rem;
  transform: translateY(-50%);
  border: 0.5rem solid transparent;
  border-left: 0.7rem solid var(--t);
  border-right: 0;
}

.causal-step-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--rule-2);
}

.causal-step-no {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--sheet-alt);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ink-2);
}

.causal-step-icon {
  color: var(--t);
}

.geo-causal-step h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
}

.geo-causal-step ul {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.geo-causal-step li {
  line-height: 1.6;
  font-size: 0.94rem;
}

.geo-causal--cause {
  border-top-color: var(--land);
}
.geo-causal--cause h3 {
  color: var(--land);
}
.geo-causal--effect {
  border-top-color: var(--pin);
}
.geo-causal--effect h3 {
  color: var(--pin);
}
.geo-causal--solution {
  border-top-color: var(--forest);
}
.geo-causal--solution h3 {
  color: var(--forest);
}

/* ════════════════════════════════════════════════════════════════════
   6. CÁC VÙNG / TIỂU VÙNG ĐỊA LÍ (REGIONS)
   ════════════════════════════════════════════════════════════════════ */
.geo-regions-wrapper {
  margin: 0.3rem 0;
}

.geo-regions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: 1rem;
}

.geo-regions li {
  padding: 1.15rem 1.3rem;
  border: 1px solid var(--t-bd);
  background: var(--t-soft);
  border-radius: 12px;
  border-left: 4px solid var(--t);
}

.region-card-head {
  display: flex;
  align-items: center;
  color: var(--t);
  margin-bottom: 0.4rem;
}

.region-card-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--t);
}

.geo-regions p {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.65;
  color: var(--ink-2);
}

/* ════════════════════════════════════════════════════════════════════
   7. BẢNG SỐ LIỆU ĐỊA LÍ (NIÊN GIÁM THỐNG KÊ)
   ════════════════════════════════════════════════════════════════════ */
.geo-grid-container {
  margin: 0.3rem 0;
}

.geo-grid-wrap {
  overflow-x: auto;
  border: 1px solid var(--rule);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.geo-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.geo-grid th {
  padding: 0.8rem 1.1rem;
  text-align: left;
  background: var(--t-soft);
  color: var(--t);
  font-weight: 700;
  border-bottom: 2px solid var(--t);
  white-space: nowrap;
}

.geo-grid td {
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--rule-2);
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.geo-grid tbody tr:nth-child(even) td {
  background: #fafbfa;
}

.geo-grid tbody tr:hover td {
  background: var(--t-soft);
}

/* ════════════════════════════════════════════════════════════════════
   8. YÊU CẦU CẦN ĐẠT & CHUẨN ĐẦU RA (GOALS)
   ════════════════════════════════════════════════════════════════════ */
.geo-goal-card {
  padding: 1.25rem 1.45rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #a7f3d0;
  border-left: 5px solid #10b981;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.06);
}

.goal-card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed rgba(16, 185, 129, 0.3);
}

.goal-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #ffffff;
  color: #059669;
  border: 1px solid #6ee7b7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.goal-eyebrow {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: #059669;
  text-transform: uppercase;
  display: block;
  line-height: 1;
  margin-bottom: 2px;
}

.goal-card-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.12rem;
  font-weight: 700;
  color: #064e3b;
}

.goal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.goal-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  line-height: 1.6;
  font-size: 0.95rem;
  color: #1e293b;
}

.goal-check-bullet {
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ════════════════════════════════════════════════════════════════════
   9. KHÁI NIỆM & GHI CHÚ ATLAT (FIELD NOTES)
   ════════════════════════════════════════════════════════════════════ */
.geo-concept {
  padding: 1.15rem 1.45rem;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  border-left: 5px solid var(--t);
  border-radius: 10px;
}

.geo-concept-head {
  display: flex;
  align-items: center;
  color: var(--t);
  margin-bottom: 0.3rem;
}

.geo-concept-label {
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--t);
}

.geo-concept p {
  margin: 0;
  line-height: 1.65;
}

.geo-note {
  display: flex;
  gap: 1rem;
  padding: 1.15rem 1.4rem;
  border-radius: 12px;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-left: 5px solid var(--t);
}

.geo-note-glyph {
  color: var(--t);
  flex-shrink: 0;
  padding-top: 2px;
}

.geo-note-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--t);
  margin-bottom: 0.35rem;
}

.geo-note p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--ink-2);
}

.geo-note strong {
  font-family: var(--display);
  color: var(--ink);
  font-weight: 700;
}

/* ════════════════════════════════════════════════════════════════════
   9. VÍ DỤ / BÀI TẬP / DANH SÁCH Ý / ĐOẠN VĂN
   ════════════════════════════════════════════════════════════════════ */
.geo-example,
.geo-exercise {
  padding: 1.25rem 1.45rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 12px;
}

.example-head,
.exercise-head {
  display: flex;
  align-items: center;
  margin-bottom: 0.6rem;
  color: var(--t);
}

.example-head h3,
.exercise-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--t);
}

.geo-exercise {
  border: 1.5px dashed var(--t-bd);
  background: var(--t-soft);
}

.geo-exercise ol {
  margin: 0 0 0.8rem;
  padding-left: 1.3rem;
}

.geo-exercise li {
  line-height: 1.65;
  margin-bottom: 0.35rem;
}

.geo-details summary {
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--t);
  display: flex;
  align-items: center;
}

.geo-details-content {
  margin-top: 0.5rem;
  padding: 0.8rem 1.1rem;
  background: var(--paper);
  border: 1px solid var(--t-bd);
  border-radius: 8px;
}

.geo-labeled {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 1.2rem;
  align-items: baseline;
}

.geo-labeled-term {
  display: flex;
  align-items: center;
  font-family: var(--display);
  font-weight: 700;
  color: var(--t);
}

.geo-facts {
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 12px;
  overflow: hidden;
}

.geo-fact {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) 1fr;
  column-gap: 1.5rem;
  padding: 0.85rem 1.35rem;
}

.geo-fact:nth-child(even) {
  background: var(--sheet);
}

.geo-fact + .geo-fact {
  border-top: 1px solid var(--rule-2);
}

.geo-fact dt {
  display: flex;
  align-items: center;
  font-family: var(--display);
  font-weight: 700;
  color: var(--t);
}

.geo-fact dd {
  margin: 0;
  line-height: 1.6;
}

.geo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.geo-list li {
  display: flex;
  gap: 0.8rem;
  line-height: 1.65;
}

.geo-list-marker {
  font-weight: 800;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.geo-para {
  margin: 0;
  line-height: 1.75;
}

/* ════════════════════════════════════════════════════════════════════
   10. TỔNG KẾT & GHI NHỚ TRỌNG TÂM (GEO RECAP)
   ════════════════════════════════════════════════════════════════════ */
.geo-recap {
  margin-top: 2rem;
  padding: 1.8rem 2rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-top: 5px solid var(--pin);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}

.geo-recap-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--rule-2);
}

.geo-recap-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--pin-soft);
  color: var(--pin);
  border: 1px solid var(--pin-bd);
  flex-shrink: 0;
}

.geo-recap-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: var(--pin);
  text-transform: uppercase;
}

.geo-recap-title {
  margin: 0;
  font-family: var(--display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
}

.geo-recap-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: 1.1rem;
}

.geo-recap-item {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--rule);
  background: var(--sheet);
  transition: transform 0.15s ease;
}

.geo-recap-item:hover {
  transform: translateY(-2px);
}

.geo-recap-icon {
  flex-shrink: 0;
  color: var(--t);
  margin-top: 2px;
}

.geo-recap-item h4 {
  margin: 0 0 0.3rem;
  font-family: var(--display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
}

.geo-recap-item p {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.6;
  color: var(--ink-2);
}

.geo-tone--sea {
  border-left: 4px solid var(--sea);
}
.geo-tone--sea .geo-recap-icon {
  color: var(--sea);
}
.geo-tone--land {
  border-left: 4px solid var(--land);
}
.geo-tone--land .geo-recap-icon {
  color: var(--land);
}
.geo-tone--forest {
  border-left: 4px solid var(--forest);
}
.geo-tone--forest .geo-recap-icon {
  color: var(--forest);
}
.geo-tone--pin {
  border-left: 4px solid var(--pin);
}
.geo-tone--pin .geo-recap-icon {
  color: var(--pin);
}

/* ════════════════════════════════════════════════════════════════════
   11. TỰ KIỂM TRA NHANH (QUICK GEO QUIZ)
   ════════════════════════════════════════════════════════════════════ */
.geo-check {
  margin-top: 1.8rem;
  padding: 1.8rem 2rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-top: 5px solid var(--sea);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}

.geo-check-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--rule);
}

.geo-check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--sea-soft);
  color: var(--sea);
  border: 1.5px solid var(--sea-bd);
  flex-shrink: 0;
}

.geo-check-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: var(--sea);
  text-transform: uppercase;
}

.geo-check-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
}

.geo-check-head p {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: var(--ink-3);
}

.geo-check-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.geo-check-item {
  padding: 1.15rem 1.35rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 12px;
}

.geo-check-q {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.geo-check-no {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sea);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.geo-check-q p {
  margin: 0.15rem 0 0;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--ink);
}

.geo-check-toggle {
  display: inline-flex;
  align-items: center;
  margin: 0.8rem 0 0 2.6rem;
  padding: 0.4rem 0.95rem;
  border: 1px solid var(--sea-bd);
  border-radius: 8px;
  background: var(--paper);
  color: var(--sea);
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.geo-check-toggle:hover {
  background: var(--sea-soft);
  border-color: var(--sea);
}

.geo-check-answer {
  margin: 0.85rem 0 0 2.6rem;
  padding: 0.95rem 1.2rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--sea);
  border-radius: 0 10px 10px 0;
  animation: fadeInAnswer 0.2s ease;
}

@keyframes fadeInAnswer {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.geo-check-source {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--sea);
  display: flex;
  align-items: center;
  margin-bottom: 0.35rem;
}

.geo-check-answer p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ink-2);
}

/* ════════════════════════════════════════════════════════════════════
   RESPONSIVE DESIGN CHO THIẾT BỊ DI ĐỘNG & TABLET
   ════════════════════════════════════════════════════════════════════ */
@media (max-width: 820px) {
  .geo-atlas-banner {
    padding: 1.1rem 1.25rem;
  }
  .geo-banner-top,
  .geo-banner-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  .geo-scale-bar {
    width: 100%;
    justify-content: space-between;
  }
  .scale-segments {
    width: 90px;
  }
  .geo-section-head {
    padding: 1rem 1.2rem;
    flex-direction: column;
    align-items: flex-start;
    background-size: auto 60%;
  }
  .geo-section-badge {
    width: 44px;
    height: 44px;
  }
  .geo-section-title {
    font-size: 1.2rem;
  }
  .geo-body {
    padding: 1.2rem;
    gap: 1.2rem;
  }
  .geo-compass {
    display: flex;
    flex-direction: column;
    padding: 1.1rem;
  }
  .geo-compass-center {
    order: -1;
    margin-bottom: 0.8rem;
  }
  .geo-compass-cell--empty {
    display: none;
  }
  .geo-compass-cell,
  .geo-compass-cell--n,
  .geo-compass-cell--s,
  .geo-compass-cell--w {
    width: 100%;
    text-align: left;
    border: 1px solid var(--rule);
    border-left: 4px solid var(--t);
  }
  .geo-proscons {
    grid-template-columns: 1fr;
  }
  .geo-causal {
    grid-auto-flow: row;
    gap: 1.8rem;
  }
  .geo-causal-step:not(:last-child)::after {
    top: auto;
    bottom: -1.3rem;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    border: 0.5rem solid transparent;
    border-top: 0.7rem solid var(--t);
    border-bottom: 0;
  }
  .geo-labeled,
  .geo-fact {
    grid-template-columns: 1fr;
    row-gap: 0.2rem;
  }
  .geo-check-toggle,
  .geo-check-answer {
    margin-left: 0;
  }
}
</style>
