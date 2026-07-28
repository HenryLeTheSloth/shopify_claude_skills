---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: ['figma-power/figma-power-overview-methodology.md', 'figma-power/figma-to-code-design.md', 'figma-power/design-system-rules.md', '.claude/commands/figma-implement.md', '.agents/skills/figma-implement-design/SKILL.md', 'docs/clone-to-shopify-playbook.md', '.claude/commands/site-implement.md']
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'So sánh hiệu quả: Figma → Liquid trực tiếp vs. Figma → HTML → Liquid (Shopify theme)'
research_goals: 'Đánh giá effort, độ chính xác/fidelity, số bước, rủi ro mất thông tin, khả năng tái dùng token/design system, tốc độ, và độ phức tạp tooling giữa 2 phương pháp convert Figma sang Shopify Liquid; đưa ra khuyến nghị cho dự án shopify-template-liquid.'
user_name: 'Fedor'
date: '2026-07-27'
web_research_enabled: true
source_verification: true
---

# Research Report: Technical

**Date:** 2026-07-27
**Author:** Fedor
**Research Type:** Technical

---

## Research Overview

Báo cáo này so sánh hai cách chuyển đổi Figma design thành Shopify Liquid cho dự án `shopify-template-liquid`: **Pipeline A** — Figma MCP → Liquid/SCSS trực tiếp, đã được triển khai và tài liệu hoá đầy đủ trong `figma-power/` — và **Pipeline B** — Figma → HTML trung gian → Liquid, một phương pháp *chưa* được triển khai trong dự án, được phân tích dựa trên nguyên lý của pipeline HTML-trung gian có thật (`site-implement`, dùng cho website sống) kết hợp khảo sát công cụ Figma-to-HTML/HTML-to-Liquid trên thị trường 2026.

Phát hiện cốt lõi: `get_design_context` của Figma MCP luôn trả về dữ liệu có cấu trúc (React+Tailwind trên JSON node-tree), trong khi đi qua HTML sẽ "nén phẳng" dữ liệu đó thành markup đã render, làm mất token/component semantics và buộc phải suy ngược giá trị bằng quan sát — đúng như `site-implement` đang phải làm với nguồn website sống. Áp dụng toán học *compounding error* (`p^n` qua nhiều bước dịch) cho thấy Pipeline B cộng thêm ít nhất 1 bước dịch nằm ngoài tầm kiểm soát của agent, làm tăng rủi ro sai lệch tích luỹ, đồng thời phát sinh chi phí vendor và phá vỡ khả năng tự động hoá trong 1 phiên agent.

Khuyến nghị: giữ Pipeline A làm phương pháp chính cho mọi task có Figma URL; Pipeline B chỉ hợp lý cho use case khác — nguồn là website sống (đã có `site-implement` phục vụ) — không cần xây thêm quy trình Figma→HTML→Liquid mới. Chi tiết đầy đủ, số liệu, và nguồn trích dẫn ở Executive Summary và các mục bên dưới.

---

<!-- Content will be appended sequentially through research workflow steps -->

## Technical Research Scope Confirmation

**Research Topic:** So sánh hiệu quả: Figma → Liquid trực tiếp vs. Figma → HTML → Liquid (Shopify theme)

**Research Goals:** Đánh giá effort, độ chính xác/fidelity, số bước, rủi ro mất thông tin, khả năng tái dùng token/design system, tốc độ, và độ phức tạp tooling giữa 2 phương pháp convert Figma sang Shopify Liquid; đưa ra khuyến nghị cho dự án shopify-template-liquid.

**Technical Research Scope:**

- Architecture Analysis - kiến trúc 2 pipeline (Figma MCP → Liquid trực tiếp, vs. Figma → HTML trung gian → Liquid), đối chiếu với pipeline HTML-trung gian đã có thật trong dự án (`site-implement`)
- Implementation Approaches - số bước, tooling, quy trình dịch (translation rules) từng pipeline
- Technology Stack - Figma MCP tools, Firecrawl, React+Tailwind intermediate format, Liquid/SCSS
- Integration Patterns - cách mỗi pipeline nạp token vào `base.scss`, xử lý assets, validate
- Performance Considerations - số tool call, rủi ro mất fidelity qua mỗi bước dịch, tốc độ, khả năng maintain/incremental update

**Research Methodology:**

- Bằng chứng nội bộ dự án (đã đọc): `figma-power/*.md`, `.claude/commands/figma-implement.md`, `.agents/skills/figma-implement-design/SKILL.md`, `docs/clone-to-shopify-playbook.md`, `.claude/commands/site-implement.md`
- Dữ liệu web hiện tại để bổ sung/verify cho pipeline B (Figma → HTML → Liquid), vốn chưa được triển khai thực tế trong dự án
- Multi-source validation cho các claim kỹ thuật quan trọng
- Confidence level framework cho thông tin chưa chắc chắn
- Toàn bộ nhận định liên quan đến pipeline B được gắn nhãn rõ là suy luận kỹ thuật, không phải benchmark đo thật trong repo

**Scope Confirmed:** 2026-07-27

---

## Technology Stack Analysis

> Ghi chú phạm vi: template gốc bao gồm các mục "Database/Storage" và "Cloud Infrastructure" — không áp dụng cho chủ đề này (2 pipeline không liên quan tới database/cloud hosting) nên được thay bằng các mục sát với domain design-to-code hơn.

### Định dạng trung gian (Intermediate Representation)

**Pipeline A (Direct):** `get_design_context` của Figma MCP server **luôn** trả về React + Tailwind theo mặc định, bất kể client framework nào được khai báo — bản thân MCP server không đổi được output format, việc "dịch" sang framework khác (ở đây là Liquid/SCSS) diễn ra hoàn toàn ở agent layer, dựa trên design-system rules do agent tự áp dụng.
_Nguồn: [Understanding get_design_context Output Formats — Figma mcp-server-guide](https://instagit.com/figma/mcp-server-guide/understanding-get-design-context-output-formats-and-customization/), [Figma MCP tools and prompts — Developer Docs](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)_

Điều này khớp với bằng chứng nội bộ dự án: `figma-power/figma-to-code-design.md` xác nhận "get_design_context trả về React + Tailwind mặc định. Agent phải translate sang Liquid/SCSS dựa trên `design-system-rules.md`". Nói cách khác, **React+Tailwind chính là lớp trung gian bắt buộc** của Pipeline A — nó không "bỏ qua" bước trung gian, chỉ là bước trung gian đó ở dạng JSX/component thay vì HTML thuần.

**Pipeline B (qua HTML):** để có HTML/CSS thuần từ Figma (không phải React+Tailwind), dự án sẽ cần thêm một plugin/tool xuất mã HTML riêng — các lựa chọn phổ biến năm 2026 gồm Anima, Builder.io Visual Copilot, Locofy, TeleportHQ, Zeplin, DhiWise, hoặc plugin cộng đồng như "Figma to Code (10x HTML)" — các tool này convert Figma design sang React/HTML/Vue, được quảng cáo giảm 30-60% thời gian dev thủ công.
_Nguồn: [8 Best Figma to Code Tools — aidesigner.ai](https://www.aidesigner.ai/blog/figma-to-code-tools), [Figma to HTML — builder.io](https://www.builder.io/blog/convert-figma-to-html), [Convert Figma Design to HTML/CSS — Figma Community plugin](https://www.figma.com/community/plugin/1421932899298722297/convert-figma-design-to-html-css)_

Điểm mấu chốt: chất lượng HTML xuất ra "dao động từ decent starting point đến gần production-ready", và **fidelity phụ thuộc nhiều vào việc file Figma có được tổ chức tốt hay không** (naming, auto-layout, component structure) — đây là yếu tố rủi ro cộng thêm mà Pipeline A không phải chịu ở mức độ tương tự, vì `get_design_context`/`get_metadata` đọc trực tiếp cấu trúc node thay vì suy luận lại từ HTML đã render.
_Nguồn: [Figma to Code — when precision matters, Anna Arteeva — Medium](https://annaarteeva.medium.com/figma-to-code-6313b420ef5a)_

### Công cụ chuyển đổi tiếp theo trong chuỗi (HTML → Liquid)

Với Pipeline B, sau khi có HTML cần thêm một bước/tool riêng để ra Liquid. Thị trường 2026 có nhiều converter HTML→Liquid độc lập (ecomgraduates, Infyways, html2liquid.dev, htmltoliquidconverter.com) — phần lớn nhận HTML tĩnh, paste vào, xuất ra `section.liquid` kèm `{% schema %}` theo chuẩn Online Store 2.0 (blocks, presets). Đây đúng là dạng "2 công cụ độc lập nối chuỗi" (Figma-to-HTML tool + HTML-to-Liquid tool), khác hẳn Pipeline A vốn là 1 pipeline liền mạch trong cùng agent/session.
_Nguồn: [HTML to Liquid Converter Tool — ecomgraduates.com](https://www.ecomgraduates.com/pages/html-to-shopify-liquid-converter-tool-auto-generate-shopify-sections), [HTML to Liquid Converter — htmltoliquidconverter.com](https://htmltoliquidconverter.com/)_

Bằng chứng nội bộ dự án cho nguyên lý HTML-trung gian (dù nguồn là website sống, không phải Figma): `site-implement` — dùng Firecrawl scrape HTML+screenshot, crop screenshot theo section, **trích design values từ HTML/CSS bằng quan sát/đo đạc thủ công** (không phải từ token/variable structured data), rồi map sang `base.scss` token. Đây chính là dạng công việc mà Pipeline B (Figma→HTML→Liquid) sẽ phải làm lại — thay vì đọc token trực tiếp từ Figma Variables API (`get_variable_defs`), phải "đoán ngược" giá trị từ CSS đã render.

### Xu hướng công nghệ (Technology Adoption Trends)

Xu hướng 2026 nghiêng về AI-driven plugin phân tích "design intent" thay vì convert máy móc theo pixel, giúp code sạch hơn và gợi ý cải thiện responsive/accessibility — nhưng đây vẫn là các tool third-party độc lập, tách rời khỏi ngữ cảnh của agent đang thực hiện task (agent không kiểm soát được cách các tool này quyết định cấu trúc HTML/class).
_Nguồn: [Must-Have Figma to Code Tools for 2026 — softspell.ai](https://www.softspell.ai/blog/best-figma-to-code-tools)_

### Đánh giá độ tin cậy (Confidence)

- **Cao:** hành vi `get_design_context` (React+Tailwind mặc định) — xác nhận chéo giữa tài liệu Figma chính thức và tài liệu nội bộ dự án.
- **Trung bình:** hiệu năng/độ chính xác thực tế của các Figma-to-HTML tool và HTML-to-Liquid converter — dựa trên marketing copy của vendor, chưa có benchmark độc lập kiểm chứng trong bài nghiên cứu này.
- **Suy luận (không phải đo thật):** toàn bộ nhận định về việc ghép 2 loại tool này lại tạo ra pipeline B hoàn chỉnh — dự án chưa từng triển khai thực tế pipeline này.

---

## Integration Patterns Analysis

> Ghi chú phạm vi: template gốc tập trung vào REST/GraphQL/gRPC/message queue/OAuth cho hệ phân tán — không khớp domain design-to-code. Các mục dưới đây được thay bằng các "integration pattern" thực sự tồn tại trong 2 pipeline: cách design data / token / asset / validation chảy vào codebase Shopify.

### Design Token Integration

**Pipeline A:** đọc token trực tiếp qua `get_variable_defs` — Figma Variables REST API trả về dữ liệu **có cấu trúc** (tên biến, giá trị, type: color/dimension/…). Xu hướng ngành 2026 là export Variables theo chuẩn **W3C DTCG** (`$value` + `$type`), được các tool như Style Dictionary/Token Transformer đọc thẳng không cần parser riêng — nghĩa là input cho bước "map vào `base.scss`" của Pipeline A về nguyên lý là **machine-readable, ít mơ hồ**.
_Nguồn: [Figma Design Tokens: Complete Guide to Variables & DTCG — atomize.tools](https://atomize.tools/blog/figma-design-tokens-guide/), [Design Tokens: How to Sync Design and Code in Figma — Figma](https://www.figma.com/resource-library/design-tokens/)_

**Pipeline B:** nếu đi qua HTML trung gian, token không còn ở dạng biến có tên — chúng đã bị "compile" thành giá trị CSS cụ thể (`color: #ff4599`, `padding: 16px`) gắn trên từng phần tử. Bằng chứng nội bộ dự án (`site-implement`) xác nhận đúng việc này: bước 4 của `/site-implement` phải **"trích màu/spacing/font của section" từ HTML/CSS bằng quan sát** rồi mới map sang token — tức là phải **suy ngược lại structured data** mà Pipeline A vốn dĩ nhận được miễn phí từ `get_variable_defs`. Đây là điểm mất mát tích hợp (integration loss) rõ ràng nhất giữa 2 pipeline.

### Data Formats trao đổi giữa các bước

| Bước | Pipeline A | Pipeline B (suy luận) |
|---|---|---|
| Figma → trung gian | JSON node-tree có cấu trúc (layout, type, variant, variable refs) qua `get_design_context`/`get_metadata` | HTML/CSS đã "render phẳng" (DOM + computed style), mất metadata component/variant gốc |
| Trung gian → Shopify | Agent đọc trực tiếp JSON, áp `design-system-rules.md`, sinh Liquid/SCSS trong cùng 1 phiên | Tool HTML→Liquid (ecomgraduates, html2liquid.dev, htmltoliquidconverter.com…) parse lại HTML tĩnh, sinh `section.liquid` + `{% schema %}` theo chuẩn Online Store 2.0 (JSON template, blocks, presets) |

_Nguồn: [HTML to Liquid Converter — htmltoliquidconverter.com](https://htmltoliquidconverter.com/), [Section schema — Shopify Dev Docs](https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema)_

Vì đích đến cuối (Shopify `{% schema %}` với `settings`/`blocks`/`presets`) giống hệt nhau ở cả 2 pipeline, sự khác biệt integration nằm hoàn toàn ở **input trước khi vào bước sinh Liquid** — A giữ được component/variant semantics, B chỉ còn markup đã dàn phẳng.

### Asset Pipeline Integration

**Pipeline A:** ảnh/icon lấy qua asset endpoint `localhost` do Figma MCP server host trực tiếp trong phiên làm việc — quy tắc dự án là dùng thẳng URL, không tạo placeholder, không cài icon package mới.

**Pipeline B:** nếu asset đến từ 1 Figma-to-HTML tool riêng (không phải qua MCP), asset URL sẽ tuỳ theo tool đó export ra (thường là link tạm hoặc file export thủ công) — không có gì đảm bảo tương thích với quy ước `assets/` của theme, nên nhiều khả năng vẫn phải làm lại bước "download qua Firecrawl" giống `site-implement` (`firecrawl scrape --format html,links` rồi tải ảnh) thay vì tận dụng được asset pipeline có sẵn của Pipeline A.

### Sync / Incremental Update Pattern

**Pipeline A:** khi design đổi, chỉ cần re-fetch `get_design_context` theo đúng `nodeId` của phần đã đổi rồi re-gen riêng phần đó — được `figma-power/figma-to-code-design.md` mô tả rõ ở mục "Incremental Update".

**Pipeline B (suy luận):** không có "nodeId" nữa sau khi đã qua HTML — muốn cập nhật 1 phần, thường phải re-export lại toàn bộ HTML từ Figma-to-HTML tool (hoặc toàn trang nếu dùng kiểu scrape như `site-implement`) rồi chạy lại converter, vì các tool HTML→Liquid độc lập không có khái niệm "đây là bản cập nhật của section X đã tồn tại".

### Integration Security / Access Patterns

- Pipeline A: xác thực qua Figma MCP OAuth (`whoami` để lấy `planKey`); riêng workflow Code Connect **yêu cầu Organization/Enterprise plan** và component phải **published** — đây là giới hạn integration đã ghi nhận trong `figma-power-overview-methodology.md`.
- Pipeline B: mỗi Figma-to-HTML tool có cơ chế auth/quota riêng (nhiều tool là SaaS bên thứ ba, có giới hạn free-tier); các HTML-to-Liquid converter online (ecomgraduates, html2liquid.dev…) thường yêu cầu paste code qua giao diện web — tức là **thêm một điểm rò rỉ dữ liệu thiết kế ra ngoài môi trường agent/IDE** so với Pipeline A vốn chạy gọn trong 1 phiên MCP.

### Đánh giá độ tin cậy (Confidence)

- **Cao:** cấu trúc `{% schema %}`/OS 2.0 và hành vi Figma Variables API/DTCG — tài liệu chính thức Shopify Dev Docs + Figma.
- **Trung bình:** hành vi cụ thể của từng HTML-to-Liquid converter (auth, quota, format output) — dựa trên landing page vendor, chưa test trực tiếp.
- **Suy luận:** toàn bộ nhận định về sync/incremental update và asset pipeline của Pipeline B — ngoại suy từ nguyên lý `site-implement`, chưa có triển khai Figma→HTML→Liquid thật để đối chứng.

---

## Architectural Patterns and Design

> Ghi chú phạm vi: các mục gốc (microservices/database/cloud deployment) được thay bằng khung phân tích kiến trúc phù hợp domain — số bước pipeline, nguyên lý thiết kế, và đặc biệt là **toán học compounding error** vốn áp dụng trực tiếp cho câu hỏi "pipeline nào hiệu quả hơn".

### System Architecture Patterns

**Pipeline A — Single-session agentic pipeline:** toàn bộ 7-9 bước (setup token → parse URL → fetch context → screenshot → assets → translate → visual parity → validate) chạy **trong cùng 1 phiên agent**, cùng 1 bộ context, không có "bàn giao" (handoff) giữa các hệ thống khác nhau. Agent giữ nguyên context từ bước 1 đến bước cuối.

**Pipeline B — Chained heterogeneous tool pattern:** kiến trúc thực chất là 2 (hoặc 3) hệ thống độc lập nối tiếp nhau — (1) Figma-to-HTML tool bên thứ ba (Anima/Locofy/Builder.io/…), (2) agent hoặc HTML-to-Liquid converter (ecomgraduates/html2liquid.dev/…) — mỗi hệ thống có model/logic riêng, không chia sẻ context hay hiểu biết về `design-system-rules.md` của dự án. Đây là pattern "pipe nhiều tool độc lập", đối lập với pattern "1 agent xuyên suốt" của Pipeline A.

### Design Principles — áp dụng được / bị mất khi thêm bước trung gian

Dự án đã tự định nghĩa các nguyên lý thiết kế cho Pipeline A trong `figma-power-overview-methodology.md`:

- **Context-First Approach** (Fetch → Visualize → Materialize → Translate → Validate): khả thi vì mọi bước đọc cùng 1 nguồn dữ liệu có cấu trúc (Figma node tree). Với Pipeline B, "Materialize" (HTML) diễn ra **trước** khi vào tay agent của dự án — agent không còn quyền truy vấn lại Figma node tree gốc nếu HTML thiếu thông tin.
- **Design Token Priority** (`project tokens > Figma raw values`): áp dụng tốt ở A vì token đến ở dạng biến có tên. Ở B, giá trị đã "cứng hoá" thành CSS cụ thể — việc map về token trở thành bài toán pattern-matching xấp xỉ (giống `site-implement` đang làm với website sống), dễ sai số hơn.
- **Reuse Over Recreation** (scan `snippets/`/`sections/` trước khi tạo mới): áp dụng như nhau ở cả 2 pipeline — đây là bước do agent dự án thực hiện *sau* khi có input, không phụ thuộc input đến từ đâu.
- **Progressive Decomposition** (Page → Section → Block → Snippet theo `get_metadata`): A decompose theo **cấu trúc component thật** của Figma (frame/component/instance). B (theo mô hình `site-implement`) chỉ decompose được theo **toạ độ pixel trên screenshot** (crop ảnh theo y1/y2) — không biết ranh giới component logic, dễ cắt sai section hoặc gộp nhầm 2 block thành 1.

### Scalability & Performance Patterns — toán học compounding error

Đây là phát hiện quan trọng nhất của phần kiến trúc. Nghiên cứu 2026 về multi-step AI pipeline chỉ ra: độ tin cậy toàn chuỗi = tích của độ tin cậy từng bước (`p^n`). Với accuracy mỗi bước ở mức "tốt" 85-90%, một pipeline **10 bước** chỉ còn 20-35% khả năng đúng toàn phần; ở mức 95%/bước, 10 bước còn ~60%. Vấn đề còn nặng hơn lý thuyết vì các bước **không độc lập** — lỗi ở bước sớm bị cuốn theo và khuếch đại ở bước sau.
_Nguồn: [The Math Behind Why Multi-Step AI Agents Fail in Production — Medium/k8slens](https://medium.com/k8slens/the-math-behind-why-multi-step-ai-agents-fail-in-production-c6d60ea6ca31), [The Compound Error Problem — Highland Edge](https://highlandedge.com/resources/insights/compound-error-problem/)_

Áp vào 2 pipeline:

- **Pipeline A:** ~7-9 bước, nhưng nhiều bước là fetch/validate xác định (không phải bước "dịch" có rủi ro sai lệch cao) — bước rủi ro thật sự chỉ tập trung ở "Translate to Shopify" (bước 5) và "Achieve Visual Parity" (bước 6). Có `validate.mjs` + tolerance check (±2px/±1px) làm **gate chặn lỗi lan truyền** trước khi merge.
- **Pipeline B:** cộng thêm **toàn bộ 1 bước dịch độc lập** (Figma→HTML qua tool bên thứ ba, chất lượng "từ decent đến gần production-ready" theo khảo sát ở phần Technology Stack) **trước khi** vào lại quy trình dịch HTML→Liquid (thêm 1 bước dịch nữa). Theo đúng cơ chế compounding: mỗi bước dịch thêm vào đều nhân thêm 1 hệ số xác suất lỗi — và quan trọng hơn, **bước đầu (Figma→HTML) nằm ngoài tầm kiểm soát của agent dự án**, không có validate/tolerance-check tuỳ chỉnh theo `design-system-rules.md` chèn vào giữa.

### Data Architecture — tham chiếu

Đã phân tích chi tiết ở mục "Design Token Integration" và bảng "Data Formats" (Integration Patterns Analysis) — không lặp lại. Kết luận cốt lõi: A giữ structured data xuyên suốt; B chuyển sang unstructured/semi-structured (rendered markup) ngay từ bước đầu.

### Deployment & Operations Architecture

**Pipeline A:** chạy hoàn toàn trong dev-time, gọi qua MCP tool calls do agent tự động hoá — có thể lặp lại (repeatable), không cần thao tác tay ngoài agent, dễ script hoá cho nhiều section/page liên tiếp (`figma-to-code-design.md` mục 7.1 "Parallel Fetch").

**Pipeline B (suy luận):** phần lớn Figma-to-HTML tool và HTML-to-Liquid converter khảo sát được là **web app độc lập** (paste code / export qua UI trình duyệt) — nghĩa là cần **thao tác thủ công ngoài agent** giữa 2 bước dịch, phá vỡ khả năng tự động hoá toàn chuỗi trong 1 phiên. Đây cũng là lý do gián tiếp khiến B khó tận dụng được cơ chế "giảm ~60% tool call khi có Design System Rules" mà Pipeline A đã đạt được (mục 6.5, `figma-power-overview-methodology.md`) — vì phần lớn công đoạn tốn effort nhất (dịch HTML→Liquid) diễn ra **ngoài** vòng lặp tool-call có thể tối ưu của agent.

### Đánh giá độ tin cậy (Confidence)

- **Cao:** toán học compounding error (`p^n`) — nguyên lý xác suất cơ bản, được nhiều nguồn 2026 xác nhận độc lập.
- **Cao:** các nguyên lý thiết kế của Pipeline A (context-first, token priority, reuse, decomposition) — trích trực tiếp từ tài liệu dự án.
- **Suy luận:** việc áp số bước cụ thể của Pipeline B và mức độ "phá vỡ tự động hoá" — chưa đo thực tế, dựa trên khảo sát UX của các tool liệt kê ở phần Technology Stack.

---

## Implementation Approaches and Technology Adoption

> Ghi chú phạm vi: mục gốc thiên về CI/CD, incident response, IaC — không áp dụng. Nội dung dưới đây bám sát domain: chi phí, workflow thực tế, rủi ro triển khai của 2 pipeline trong bối cảnh dự án `shopify-template-liquid`.

### Technology Adoption Strategies

Pipeline A **đã được triển khai và tài liệu hoá đầy đủ** trong dự án (`figma-power/*`, `.claude/commands/figma-implement.md`) — chi phí adoption gần như bằng 0 (không cần đánh giá/mua thêm vendor). Pipeline B là **net-new adoption**: cần khảo sát, chọn, và trả phí cho ít nhất 2 vendor riêng biệt (1 Figma-to-HTML + 1 HTML-to-Liquid), mỗi vendor có model pricing/quota khác nhau — đây là chi phí chuyển đổi (switching cost) thật sự, không chỉ là chi phí kỹ thuật.

### Development Workflows và Tooling — chi phí vận hành cụ thể

| | Pipeline A | Pipeline B |
|---|---|---|
| Free tier | Không cần — nằm trong quyền Figma MCP đã có | Anima: 5 generations/ngày · Locofy: 600 token miễn phí · Builder.io: free tier giới hạn |
| Chi phí trả phí | — | Anima $20-40/seat/tháng (Enterprise $500+/tháng) · Locofy $33.3-99.9/tháng · Builder.io từ $19/seat/tháng — **cộng thêm** chi phí HTML→Liquid converter (nhiều tool free nhưng giới hạn quota/watermark) |
| Vị trí trong workflow | Trong agent, cùng phiên với `search_docs.mjs`/`validate.mjs` | Ngoài agent (web UI riêng), phải copy-paste thủ công giữa các bước |

_Nguồn: [Anima Review 2026 — toolworthy.ai](https://www.toolworthy.ai/tool/animaapp), [Locofy vs Builder.io vs Anima 2026 — sitegrade.io](https://sitegrade.io/en/blog/locofy-vs-builder-io-vs-anima-design-to-code-2026/), [AI Figma-to-Code in 2026 — sixtythirtyten](https://www.sixtythirtyten.co/blog/from-figma-to-code-ai-design-to-dev-workflows-in-2026)_

Với số lượng section/page điển hình của 1 theme Shopify (tham khảo `docs/clone-to-shopify-playbook.md`: header, footer, home, product, collection, page/blog — thường 15-30+ section riêng lẻ), free tier 5 generations/ngày hoặc 600 token của các tool này **rất dễ cạn** trong 1-2 ngày làm việc, buộc phải nâng cấp gói trả phí — một chi phí mà Pipeline A không phát sinh.

### Testing và Quality Assurance

Cả 2 pipeline **đều dùng chung** bộ QA hạ nguồn của dự án: `validate.mjs`, `search_docs.mjs`, `/shopify-visual-test`, `/shopify-audit` — điểm này trung lập. Khác biệt nằm ở *lượng lỗi phải sửa trước khi validate*: theo phân tích compounding error ở phần Architectural Patterns, Pipeline B nhiều khả năng đưa vào validate.mjs một input có sai lệch tích luỹ cao hơn (từ 2 bước dịch thay vì 1), nghĩa là **nhiều vòng lặp fix-revalidate hơn** dù cùng dùng 1 bộ test.

### Team Organization và Skills

- **Pipeline A:** cần hiểu `design-system-rules.md` + quy ước `base.scss` — kiến thức tập trung, chỉ 1 nơi để học/maintain.
- **Pipeline B:** cần thêm kỹ năng vận hành ít nhất 2 tool bên thứ ba (UI riêng, giới hạn riêng, đôi khi output framework không đồng nhất — ví dụ Locofy có thể export React thay vì HTML thuần), **cộng thêm** vẫn phải biết Liquid/SCSS để dọn lại output vì các converter HTML→Liquid không biết về `design-system-rules.md` của dự án (BEM, token, `padding_top/bottom` schema convention…) — nghĩa là bước dọn dẹp thủ công sau khi convert gần như chắc chắn xảy ra.

### Risk Assessment và Mitigation

| Rủi ro | Pipeline A | Pipeline B |
|---|---|---|
| Compounding error qua nhiều bước dịch | Thấp — 1 bước dịch chính, có gate validate | Cao — ≥2 bước dịch độc lập, không gate giữa các bước |
| Mất semantic/component structure | Thấp — giữ node tree đến tận lúc sinh code | Cao — HTML render phẳng, mất variant/component metadata (mục Technology Stack) |
| Rò rỉ dữ liệu thiết kế ra ngoài | Thấp — chạy trong MCP/agent nội bộ | Trung-cao — design/code đi qua ≥1 SaaS bên thứ ba qua trình duyệt |
| Chi phí vendor phát sinh | Không | Có — 2 vendor, dễ vượt free tier với quy mô theme thật |
| Khả năng tự động hoá/lặp lại | Cao — script hoá được qua agent | Thấp — thao tác tay giữa các bước phá vỡ tự động hoá |
| Incremental update khi design đổi | Có (`nodeId`-based) | Không rõ ràng — nhiều khả năng phải re-export toàn bộ |
| Không có Figma URL cụ thể / chỉ có ảnh tĩnh | Không áp dụng được (cần Figma) | Vẫn cần Figma làm nguồn — B không giải quyết được trường hợp này tốt hơn A |

**Mitigation nếu buộc phải dùng Pipeline B** (ví dụ: file Figma không cho MCP truy cập, hoặc cần bàn giao HTML cho bên thứ ba không dùng Claude Code): chèn thêm 1 bước validate thủ công **ngay sau** giai đoạn Figma→HTML (so HTML render với `get_screenshot` gốc trước khi đưa vào converter tiếp theo) để chặn lỗi lan truyền sớm, thay vì để dồn đến bước HTML→Liquid mới phát hiện.

## Technical Research Recommendations

### Implementation Roadmap

1. **Giữ Pipeline A (Figma → Liquid trực tiếp) làm phương pháp chính** cho mọi task có Figma URL truy cập được qua MCP — đây là con đường ít bước dịch nhất, có gate validate, có incremental update, và đã vận hành sẵn trong dự án.
2. **Chỉ cân nhắc yếu tố "HTML trung gian" khi nguồn không phải là Figma** — tức là dùng đúng use case mà `site-implement` đã thiết kế cho: clone từ website sống. Đây không phải là "Pipeline B áp dụng cho Figma" mà là một bài toán khác (nguồn = HTML thật, không phải Figma), nên **không cần thêm** một quy trình Figma→HTML→Liquid mới.
3. Nếu tương lai có yêu cầu thật sự cần Figma→HTML→Liquid (vd: giao HTML cho một bên thứ ba không dùng agent này), pilot ở quy mô nhỏ (1 section đơn giản) trước, đo compounding error thực tế thay vì suy luận, trước khi rollout diện rộng.

### Technology Stack Recommendations

- Không cần bổ sung vendor mới (Anima/Locofy/Builder.io/html2liquid…) cho luồng công việc hiện tại của dự án — Pipeline A qua Figma MCP đã đủ và không phát sinh chi phí license.
- Nếu ngân sách cho phép thử nghiệm B trong tương lai, ưu tiên tool có **API/CLI** (vd TokensBrücke cho token export) hơn tool chỉ có web UI thuần, để giữ được khả năng tự động hoá một phần.

### Skill Development Requirements

- Ưu tiên đầu tư sâu vào `design-system-rules.md` + `base.scss` token system (đòn bẩy chính đã chứng minh giảm ~60% tool call theo tài liệu dự án) thay vì đầu tư học thêm công cụ Figma-to-HTML bên thứ ba.

### Success Metrics và KPIs

Để so sánh khách quan nếu dự án muốn tự đo thay vì dựa vào suy luận trong báo cáo này:

- Số tool-call / thao tác thủ công trên mỗi section
- Số vòng lặp fix-revalidate trước khi `validate.mjs` pass
- Độ lệch visual sau bước đầu tiên (trước khi vào bước dịch cuối) — đo bằng % vượt tolerance ±2px/±1px
- Thời gian wall-clock từ "có Figma URL" đến "section pass validate + visual test"
- Chi phí vendor phát sinh / theme (mục tiêu Pipeline A: 0đ)

---

# Figma → Liquid trực tiếp vs. Figma → HTML → Liquid: Báo cáo so sánh hiệu quả cho `shopify-template-liquid`

## Executive Summary

Dự án `shopify-template-liquid` đã xây dựng và tài liệu hoá đầy đủ một pipeline "Figma → Liquid trực tiếp" (Pipeline A) qua Figma MCP server. Báo cáo này trả lời câu hỏi: liệu chèn thêm một bước HTML trung gian ("Pipeline B": Figma → HTML → Liquid) có làm quy trình hiệu quả hơn không? Trong bối cảnh 2026, khi AI coding agent đã trở thành công cụ chủ đạo để viết Liquid/theme code (84% developer dùng hoặc dự định dùng AI tool, theo Stack Overflow Developer Survey), câu hỏi này ảnh hưởng trực tiếp đến tốc độ và chi phí dựng theme của dự án.
_Nguồn: [State of Shopify AI 2026 — fudge.ai](https://www.fudge.ai/blog/state-of-shopify-ai-2026/)_

Kết luận: **Pipeline B kém hiệu quả hơn Pipeline A trên mọi tiêu chí đã khảo sát** — effort, fidelity, số bước, rủi ro mất thông tin, khả năng tái dùng token, tốc độ, và độ phức tạp tooling — trừ một trường hợp duy nhất mà B thực chất không phải là "B áp dụng cho Figma" mà là một bài toán khác: nguồn dữ liệu là HTML thật từ website sống, đúng use case mà `site-implement` của dự án đã phục vụ sẵn.

**Phát hiện kỹ thuật chính:**

- **Dự án đã tự xây dựng một bộ công cụ (`figma-power/`) được thiết kế riêng để tối đa độ chính xác khi convert Figma → Liquid** — không phải chỉ dựa vào hành vi mặc định của Figma MCP. Bộ này gồm: `design-system-rules.md` (quy tắc dịch Figma → token/Liquid/SCSS cụ thể cho dự án), pipeline 7 bước có bước "Achieve Visual Parity" bắt buộc với tolerance đo được (±2px spacing, ±1px font), và cổng chặn lỗi `validate.mjs` + `search_docs.mjs` (`figma-power/design-system-rules.md`, `.claude/commands/figma-implement.md`). Đây là lợi thế **không thể sao chép** bởi Pipeline B, vì các công cụ Figma-to-HTML/HTML-to-Liquid bên thứ ba (Anima, Locofy, html2liquid.dev…) hoàn toàn không biết đến các quy tắc/tolerance riêng này của dự án.
- `get_design_context` của Figma MCP **luôn** trả về dữ liệu có cấu trúc (JSON node-tree, React+Tailwind) bất kể cấu hình — đây là nguồn input machine-readable, ít mơ hồ nhất có thể lấy từ Figma.
- Đưa dữ liệu đó qua một bước "render thành HTML" trước khi vào Liquid sẽ **xoá mất** token semantics (biến có tên → giá trị CSS cứng) và component/variant structure — buộc Pipeline B phải "đoán ngược" giá trị bằng quan sát, y hệt cách `site-implement` đang làm cho website sống.
- Toán học **compounding error** (`p^n` qua nhiều bước dịch, theo nghiên cứu 2026 về multi-step AI pipeline) cho thấy mỗi bước dịch thêm vào đều nhân thêm rủi ro sai lệch — Pipeline B cộng thêm ít nhất 1 bước dịch (Figma→HTML) nằm **ngoài tầm kiểm soát** của agent và quy ước `design-system-rules.md` của dự án.
- Pipeline B phát sinh **chi phí vendor thực tế**: các Figma-to-HTML tool phổ biến (Anima, Locofy, Builder.io) có free tier rất hẹp (5 generations/ngày, 600 token…) — dễ cạn khi dựng 15-30+ section của 1 theme thật, buộc nâng cấp gói trả phí, cộng thêm chi phí HTML-to-Liquid converter riêng.
- Pipeline B **phá vỡ khả năng tự động hoá trong 1 phiên agent** vì phần lớn tool khảo sát được là web app yêu cầu thao tác tay (copy-paste), làm mất chính lợi thế "giảm ~60% tool call" mà Pipeline A đã đạt được nhờ Design System Rules First.

**Khuyến nghị chiến lược (top 3):**

1. Giữ nguyên Pipeline A làm phương pháp duy nhất cho mọi task có Figma URL truy cập được — không đầu tư thêm vào hướng "HTML trung gian" cho nguồn Figma. **Tiếp tục đầu tư hoàn thiện bộ công cụ tự xây (`figma-power/`)** — đây chính là tài sản kỹ thuật đã tạo ra lợi thế chính xác của Pipeline A, và là hướng đầu tư có lợi tức cao hơn nhiều so với việc mua thêm công cụ bên thứ ba cho Pipeline B.
2. Không xây một quy trình Figma→HTML→Liquid mới — nếu có nhu cầu "HTML trung gian" thật sự, đó là dấu hiệu nguồn dữ liệu là website sống, dùng `site-implement` sẵn có.
3. Nếu buộc phải dùng công cụ Figma-to-HTML bên thứ ba (trường hợp đặc biệt, ví dụ MCP không truy cập được file), chèn một bước validate thủ công ngay sau bước xuất HTML (so với `get_screenshot` gốc) để chặn lỗi lan truyền sớm thay vì để dồn đến bước cuối.

## Table of Contents

1. Phương pháp nghiên cứu
2. Kiến trúc & Technology Stack — hai pipeline
3. Integration Patterns — token, asset, sync, security
4. Architectural Patterns — nguyên lý thiết kế & toán học compounding error
5. Implementation & chi phí vận hành thực tế
6. Đánh giá rủi ro tổng hợp
7. Khuyến nghị chiến lược & lộ trình
8. Nguồn & mức độ tin cậy
9. Kết luận

## 1. Phương pháp nghiên cứu

- **Phạm vi:** so sánh 2 pipeline convert Figma → Shopify Liquid trong bối cảnh cụ thể của dự án `shopify-template-liquid`, không phải so sánh chung chung "design-to-code tools".
- **Nguồn nội bộ (bằng chứng trực tiếp, đã đọc toàn văn):** `figma-power/figma-power-overview-methodology.md`, `figma-power/figma-to-code-design.md`, `figma-power/design-system-rules.md`, `.claude/commands/figma-implement.md`, `.agents/skills/figma-implement-design/SKILL.md`, `docs/clone-to-shopify-playbook.md`, `.claude/commands/site-implement.md`.
- **Nguồn ngoài (web, 2026):** tài liệu Figma MCP chính thức, khảo sát Figma-to-HTML/HTML-to-Liquid tool, nghiên cứu về compounding error trong multi-step AI pipeline, tài liệu Shopify Online Store 2.0 schema, W3C DTCG design tokens.
- **Giới hạn quan trọng:** Pipeline B **chưa từng được triển khai** trong dự án này. Mọi nhận định về B là suy luận kỹ thuật (ngoại suy từ nguyên lý `site-implement` + khảo sát công cụ thị trường), không phải benchmark đo thật. Báo cáo gắn nhãn rõ "suy luận" ở từng mục để tránh nhầm với dữ liệu đo thực tế.

## 2. Kiến trúc & Technology Stack — hai pipeline

Xem chi tiết đầy đủ ở mục "Technology Stack Analysis" phía trên. Tóm tắt: Pipeline A dùng React+Tailwind (do Figma MCP quy định cứng) làm lớp trung gian bắt buộc nhưng vẫn giữ được structured data; Pipeline B cần thêm 1 công cụ Figma-to-HTML riêng (Anima/Locofy/Builder.io/TeleportHQ/DhiWise…) để có HTML thuần, sau đó cần thêm 1 HTML-to-Liquid converter (ecomgraduates/html2liquid.dev/htmltoliquidconverter.com…) — 2 hệ thống độc lập, không chia sẻ context với `design-system-rules.md` của dự án.

## 3. Integration Patterns — token, asset, sync, security

Xem chi tiết đầy đủ ở mục "Integration Patterns Analysis" phía trên. Tóm tắt bằng bảng:

| Khía cạnh | Pipeline A | Pipeline B (suy luận) |
|---|---|---|
| Token | Đọc trực tiếp qua `get_variable_defs`, structured (hướng W3C DTCG) | Phải suy ngược từ CSS đã render, xấp xỉ như `site-implement` |
| Asset | Endpoint localhost của MCP, dùng thẳng | Phụ thuộc tool xuất ra, có thể cần scrape lại |
| Incremental update | Re-fetch theo `nodeId` | Không rõ ràng, nhiều khả năng phải re-export toàn bộ |
| Bảo mật dữ liệu thiết kế | Nằm trong phiên MCP/agent nội bộ | Đi qua ≥1 SaaS bên thứ ba qua trình duyệt |

## 4. Architectural Patterns — nguyên lý thiết kế & toán học compounding error

Xem chi tiết đầy đủ ở mục "Architectural Patterns and Design" phía trên. Điểm mấu chốt cần nhớ: độ tin cậy toàn chuỗi = tích độ tin cậy từng bước (`p^n`). Ở mức 85-90% accuracy/bước (mức "tốt" cho model hiện đại), một pipeline 10 bước chỉ còn 20-35% khả năng đúng toàn phần. Pipeline A giữ số bước dịch rủi ro cao ở mức tối thiểu (~2 bước: translate + visual parity) có gate validate; Pipeline B cộng thêm nguyên 1 bước dịch độc lập không có gate.

## 5. Implementation & chi phí vận hành thực tế

Xem chi tiết đầy đủ ở mục "Implementation Approaches and Technology Adoption" phía trên. Tóm tắt: Pipeline A có sẵn, chi phí adoption ~0. Pipeline B đòi hỏi khảo sát + trả phí ≥2 vendor (Anima $20-40/seat/tháng, Locofy $33.3-99.9/tháng, Builder.io từ $19/seat/tháng, cộng thêm HTML-to-Liquid converter) và free tier dễ cạn với quy mô theme thật (15-30+ section).

## 6. Đánh giá rủi ro tổng hợp

Xem bảng đầy đủ ở mục "Risk Assessment và Mitigation" phía trên (7 tiêu chí: compounding error, mất semantic structure, rò rỉ dữ liệu, chi phí vendor, khả năng tự động hoá, incremental update, trường hợp không có Figma URL). Pipeline A thắng ở 6/7 tiêu chí; tiêu chí còn lại (không có Figma URL) không phân biệt được 2 pipeline vì cả hai đều cần Figma.

## 7. Khuyến nghị chiến lược & lộ trình

Xem "Technical Research Recommendations" phía trên cho roadmap, tech stack recommendation, skill development, và success metrics/KPIs đầy đủ nếu dự án muốn tự đo lại bằng dữ liệu thật thay vì suy luận.

## 8. Nguồn & mức độ tin cậy

**Nguồn chính (đã trích dẫn xuyên suốt báo cáo):**

- [Understanding get_design_context Output Formats — Figma mcp-server-guide](https://instagit.com/figma/mcp-server-guide/understanding-get-design-context-output-formats-and-customization/)
- [Figma MCP tools and prompts — Developer Docs](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [8 Best Figma to Code Tools — aidesigner.ai](https://www.aidesigner.ai/blog/figma-to-code-tools)
- [Figma to HTML — builder.io](https://www.builder.io/blog/convert-figma-to-html)
- [Figma to Code — when precision matters, Anna Arteeva — Medium](https://annaarteeva.medium.com/figma-to-code-6313b420ef5a)
- [HTML to Liquid Converter — htmltoliquidconverter.com](https://htmltoliquidconverter.com/)
- [Section schema — Shopify Dev Docs](https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema)
- [Figma Design Tokens: Complete Guide to Variables & DTCG — atomize.tools](https://atomize.tools/blog/figma-design-tokens-guide/)
- [The Math Behind Why Multi-Step AI Agents Fail in Production — Medium/k8slens](https://medium.com/k8slens/the-math-behind-why-multi-step-ai-agents-fail-in-production-c6d60ea6ca31)
- [The Compound Error Problem — Highland Edge](https://highlandedge.com/resources/insights/compound-error-problem/)
- [Anima Review 2026 — toolworthy.ai](https://www.toolworthy.ai/tool/animaapp)
- [Locofy vs Builder.io vs Anima 2026 — sitegrade.io](https://sitegrade.io/en/blog/locofy-vs-builder-io-vs-anima-design-to-code-2026/)
- [State of Shopify AI 2026 — fudge.ai](https://www.fudge.ai/blog/state-of-shopify-ai-2026/)

**Khung mức độ tin cậy áp dụng xuyên suốt:**

- **Cao** — trích dẫn trực tiếp từ tài liệu dự án (`figma-power/*`, các slash-command) hoặc tài liệu chính thức Figma/Shopify; nguyên lý toán học compounding error.
- **Trung bình** — hành vi cụ thể của các tool bên thứ ba (Anima/Locofy/Builder.io/HTML-to-Liquid converter), dựa trên landing page/review vendor, chưa test trực tiếp trong dự án.
- **Suy luận** — mọi nhận định về việc Pipeline B vận hành ra sao trong thực tế, vì pipeline này chưa từng được triển khai trong `shopify-template-liquid`. Được gắn nhãn rõ ở từng mục liên quan.

**Giới hạn nghiên cứu:** báo cáo không có số đo thực nghiệm (benchmark) cho Pipeline B — khuyến nghị ở mục "Success Metrics và KPIs" (phần Implementation Research) nếu dự án muốn tự đo để kiểm chứng lại kết luận này.

## Kết luận

Đối với dự án `shopify-template-liquid`, việc thêm bước HTML trung gian giữa Figma và Liquid **không mang lại lợi ích hiệu quả nào** so với pipeline trực tiếp đã có — nó chỉ thêm bước dịch, thêm rủi ro sai lệch tích luỹ, thêm chi phí vendor, và làm mất khả năng tự động hoá. Pipeline A nên tiếp tục là con đường mặc định. Nhu cầu "HTML trung gian" chỉ chính đáng khi nguồn dữ liệu thực sự là HTML (website sống) — trường hợp đó đã được `site-implement` giải quyết, không cần xây thêm quy trình mới cho nguồn Figma.

---

**Ngày hoàn thành nghiên cứu:** 2026-07-27
**Tác giả:** Fedor (thực hiện bởi Mary — Business Analyst)
**Mức độ tin cậy tổng thể:** Cao cho Pipeline A (dựa trên tài liệu nội bộ dự án đã xác minh); Trung bình/Suy luận cho Pipeline B (chưa có triển khai thực tế để đối chứng).

---

## Phụ lục: Làm rõ bản chất Liquid — về cơ bản Liquid *là* HTML, được render trên server

Bổ sung theo yêu cầu (2026-07-27): cần làm rõ một điểm nền tảng có thể gây hiểu nhầm trong toàn bộ so sánh ở trên — **file `.liquid` không phải một định dạng tách biệt với HTML**. Về bản chất, Liquid là ngôn ngữ template chèn logic động (`{{ }}`, `{% %}`) vào giữa markup HTML thông thường; khi Shopify server xử lý (render) file này ở mỗi request, kết quả trả về trình duyệt là HTML thuần.

### Bằng chứng cụ thể

**Từ tài liệu chính thức Shopify:**

- GitHub chính thức của Shopify mô tả Liquid: *"Liquid markup language. Safe, customer facing template language for flexible web apps."*
  _Nguồn: [Shopify/liquid — GitHub](https://github.com/shopify/liquid)_
- Tài liệu Liquid reference chính thức xác nhận: *"Shopify Liquid templating is a server-side template language. It renders to HTML/CSS/JavaScript."*
  _Nguồn: [Liquid reference — shopify.dev](https://shopify.dev/docs/api/liquid)_
- Tài liệu kiến trúc Sections của Shopify mô tả trực tiếp cấu trúc 1 file section: *"Each file is a .liquid file that contains both the HTML/Liquid markup and a `{% schema %}` tag at the bottom. The markup section contains your HTML structure mixed with Liquid code. This is what actually renders on the page."*
  _Nguồn: [Sections — Theme architecture, shopify.dev](https://shopify.dev/docs/storefronts/themes/architecture/sections)_
- Về cách Liquid kết hợp nội dung tĩnh và động: *"A template language allows you to create a single template to host static content, and dynamically insert information depending on where the template is rendered... Liquid acts as a bridge between static HTML and dynamic data stored in Shopify's backend."*
  _Nguồn: khảo sát tổng hợp tài liệu Shopify theme development 2026_

**Từ chính tài liệu nội bộ dự án (bằng chứng mạnh nhất vì đây là quy ước dự án đang áp dụng):**

- `figma-power/design-system-rules.md` (mục "Liquid file — chỉ HTML + schema"): *"Liquid file chứa HTML cấu trúc và `{% schema %}`. Không có style inline (ngoại lệ: dynamic settings)."* — xác nhận rõ ràng: bản thân file `.liquid` mà agent của dự án tạo ra **chính là HTML** (cộng thêm khối `{% schema %}` JSON).
- `figma-power/figma-to-code-design.md` mục 6 (ví dụ thực tế) cho thấy trực tiếp: code "Liquid" được sinh ra trong ví dụ chứa nguyên các thẻ HTML chuẩn (`<section class="featured-products" id="shopify-section-{{ section.id }}">`, `<div class="page-width">`, `<h2 class="featured-products__heading">`…) xen lẫn tag Liquid (`{%- for -%}`, `{% render %}`) — không có bước "dịch sang định dạng khác HTML" nào cả, đây là HTML thật ngay từ khi viết.

### Ý nghĩa đối với so sánh Pipeline A vs Pipeline B

Điểm này **không làm thay đổi kết luận** của báo cáo, nhưng làm nó **chính xác và sắc hơn**. Cách diễn đạt đúng không phải là "Pipeline A tránh né HTML, Pipeline B đi qua HTML" — vì **cả hai pipeline đều kết thúc ở HTML** (nằm bên trong file `.liquid`, render ra HTML thật ở server). Sự khác biệt thật sự nằm ở chỗ khác:

1. **Pipeline A viết HTML+Liquid trực tiếp từ dữ liệu Figma có cấu trúc** (JSON node-tree, biến/token có tên) — agent tự quyết định phần nào là HTML tĩnh, phần nào cần biến thành `{% schema %}`/`{{ }}` động, dựa trên hiểu biết về ngữ cảnh Figma gốc (component nào là gì, biến nào ánh xạ token nào).
2. **Pipeline B tạo ra HTML tĩnh đã "đông cứng" trước** (không có `{% %}`/`{{ }}`, không có khái niệm setting nào nên động), rồi mới đưa qua một công cụ *khác* để "bơm ngược" tính động vào — công cụ HTML-to-Liquid này phải **tự đoán** phần nào nên trở thành `section.settings`, phần nào giữ nguyên tĩnh, dựa trên phân tích cú pháp HTML chung chung, **không biết gì về quy ước `design-system-rules.md`** của dự án (ví dụ bắt buộc có `padding_top`/`padding_bottom`, dùng `render` không dùng `include`, BEM theo tên frame Figma…).

Nói cách khác: cả hai pipeline đều phải tạo ra đúng 1 thứ giống nhau — HTML kết hợp với logic Liquid. Khác biệt là **Pipeline A tạo ra thứ đó trực tiếp, có đầy đủ ngữ cảnh**; **Pipeline B tạo ra một bản HTML tĩnh trung gian rồi phải suy luận ngược lại phần logic động đã bị bỏ qua** — đây chính là bước thừa, tốn thêm effort, và là nguồn phát sinh compounding error đã phân tích ở mục Architectural Patterns, chứ không phải vì "HTML" tự nó là xấu hay khác biệt về bản chất so với Liquid.

---

## Phụ lục: Số liệu minh hoạ so sánh 2 pipeline

Bổ sung theo yêu cầu (2026-07-27). **Quan trọng — đọc trước khi dùng số liệu này:** Pipeline B chưa từng được triển khai thật trong dự án, nên **không có số đo thực nghiệm (benchmark) nào** cho B. Phần dưới đây tách rõ 2 loại số liệu để không bị nhầm lẫn:

- **(a) Số liệu đã công bố, có nguồn thật** — trích trực tiếp từ tài liệu dự án hoặc khảo sát thị trường đã dẫn ở các phần trên.
- **(b) Số liệu mô hình hoá/ước tính** — áp công thức xác suất `p^n` (đã dẫn ở mục Architectural Patterns) vào số bước thực tế của từng pipeline. Đây là **kết quả của một phép tính**, không phải kết quả đo — nếu giả định đầu vào (85/90/95% accuracy mỗi bước) thay đổi, con số cũng thay đổi theo.

### (a) Số liệu đã công bố, có nguồn thật

| Chỉ số | Pipeline A | Pipeline B | Nguồn |
|---|---|---|---|
| Số tool-call trung bình / component | ~15-20 (chưa có Design System Rules) → **~5-8** (đã có, đang là trạng thái hiện tại của dự án) | Không có dữ liệu tương đương (phần lớn là thao tác UI thủ công, không phải tool-call agent) | `figma-power-overview-methodology.md` mục 6.5 |
| Free tier trước khi phải trả phí | Không giới hạn theo kiểu này — nằm trong quyền MCP đã có | Anima: 5 lượt/ngày · Locofy: 600 token · Builder.io: giới hạn (không công bố số cụ thể) | [Anima Review 2026](https://www.toolworthy.ai/tool/animaapp), [Locofy vs Builder.io vs Anima 2026](https://sitegrade.io/en/blog/locofy-vs-builder-io-vs-anima-design-to-code-2026/) |
| Chi phí trả phí / tháng (nếu vượt free tier) | 0đ | Anima $20-40/seat (Enterprise $500+) · Locofy $33.3-99.9 · Builder.io từ $19/seat — **chưa tính** thêm converter HTML→Liquid | như trên |
| Tolerance chấp nhận khi validate | ±2px spacing, ±1px font (bắt buộc, có gate `validate.mjs`) | Không có gate tương đương được ghi nhận ở bất kỳ tool nào khảo sát | `figma-power/design-system-rules.md` mục 10 |

### (b) Số liệu mô hình hoá theo compounding error (KHÔNG phải đo thật)

**Số bước "có rủi ro dịch sai" (lossy translation step) của mỗi pipeline**, xác định từ chính pipeline đã mô tả ở các mục trên — không tính các bước fetch/download/validate thuần kỹ thuật (rủi ro thấp, có gate riêng):

- **Pipeline A — 2 bước rủi ro:** (1) Translate to Shopify (bước 5), (2) Achieve Visual Parity (bước 6). _Nguồn số bước: `figma-power/figma-to-code-design.md` mục 4.1._
- **Pipeline B — 5 bước rủi ro (suy luận):** (1) Figma → HTML/CSS qua tool bên thứ ba, (2) suy ngược token/màu/spacing từ CSS đã render (như `site-implement` đang phải làm), (3) HTML → Liquid qua converter riêng, (4) dọn lại theo quy ước `design-system-rules.md` mà converter không biết, (5) Achieve Visual Parity (giống A).

Áp công thức `p^n` (n = số bước rủi ro) với 3 mức accuracy/bước mà chính nguồn nghiên cứu compounding error đã dùng làm ví dụ minh hoạ (85%, 90%, 95%):

| Accuracy giả định / bước | Pipeline A (n=2) | Pipeline B (n=5) | Chênh lệch |
|---|---|---|---|
| 85% | 0.85² ≈ **72%** | 0.85⁵ ≈ **44%** | ~28 điểm % |
| 90% | 0.90² ≈ **81%** | 0.90⁵ ≈ **59%** | ~22 điểm % |
| 95% | 0.95² ≈ **90%** | 0.95⁵ ≈ **77%** | ~13 điểm % |

_Công thức và các mức accuracy ví dụ (85/90/95%) theo: [The Math Behind Why Multi-Step AI Agents Fail in Production — Medium/k8slens](https://medium.com/k8slens/the-math-behind-why-multi-step-ai-agents-fail-in-production-c6d60ea6ca31), [The Compound Error Problem — Highland Edge](https://highlandedge.com/resources/insights/compound-error-problem/). Số bước rủi ro (n=2 và n=5) là ước tính của báo cáo này dựa trên cấu trúc pipeline đã mô tả, không phải số liệu do 2 nguồn trên công bố._

**Cách đọc bảng này đúng:** đây là minh hoạ mức độ ảnh hưởng của việc "thêm bước dịch" theo một mô hình xác suất đơn giản (giả định các bước độc lập — thực tế các bước còn phụ thuộc nhau nên sai lệch thực tế có thể **cao hơn** con số trong bảng, như phần Architectural Patterns đã nêu). Đây **không phải** kết quả benchmark đo trên dự án `shopify-template-liquid`. Muốn có số đo thật, cần chạy pilot test theo đề xuất ở mục "Success Metrics và KPIs" (phần Implementation Research).
