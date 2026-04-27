from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt


OUTPUT_PATH = "/Users/maxwell/Downloads/Unleashed/output/doc/An_Defend_Study_Guide_V2_Extended.docx"


def set_cell_text(cell, text, bold=False):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.size = Pt(10.5)


def add_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Inches(0.25 * level)
        run = p.add_run(item)
        run.font.size = Pt(11)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        run = p.add_run(item)
        run.font.size = Pt(11)


def add_paragraph(doc, text, style=None, italic=False, bold=False):
    p = doc.add_paragraph(style=style)
    run = p.add_run(text)
    run.italic = italic
    run.bold = bold
    run.font.size = Pt(11)
    return p


def add_code_block(doc, lines):
    for line in lines:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.35)
        run = p.add_run(line)
        run.font.name = "Courier New"
        r = run._element
        r.rPr.rFonts.set(qn("w:eastAsia"), "Courier New")
        run.font.size = Pt(9.5)


def add_heading(doc, text, level):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.name = "Times New Roman"
    return p


def add_page_break(doc):
    doc.add_page_break()


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def add_simple_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for idx, head in enumerate(headers):
        set_cell_text(hdr[idx], head, bold=True)
        if col_widths:
            hdr[idx].width = Inches(col_widths[idx])
    set_repeat_table_header(table.rows[0])
    for row_values in rows:
        row = table.add_row().cells
        for idx, value in enumerate(row_values):
            set_cell_text(row[idx], str(value))
            if col_widths:
                row[idx].width = Inches(col_widths[idx])
    return table


def init_document():
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.7)
    section.bottom_margin = Inches(0.7)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    styles = doc.styles
    styles["Normal"].font.name = "Times New Roman"
    styles["Normal"].font.size = Pt(11)
    styles["Title"].font.name = "Times New Roman"
    styles["Title"].font.size = Pt(24)
    styles["Heading 1"].font.name = "Times New Roman"
    styles["Heading 1"].font.size = Pt(16)
    styles["Heading 2"].font.name = "Times New Roman"
    styles["Heading 2"].font.size = Pt(14)
    styles["Heading 3"].font.name = "Times New Roman"
    styles["Heading 3"].font.size = Pt(12)
    return doc


lookup_rows = {
    "role": [
        ("1", "ADMIN", "Quản trị hệ thống, cấu hình và quản lý tài khoản"),
        ("2", "CUSTOMER", "Người dùng mua hàng"),
        ("3", "STAFF", "Nhân sự vận hành dashboard, kho, đơn, sale"),
    ],
    "payment_method": [
        ("1", "COD", "Thanh toán khi nhận hàng"),
        ("2", "VNPAY", "Thanh toán online qua VNPay"),
        ("3", "TRANSFER", "Chuyển khoản thủ công"),
    ],
    "shipping_method": [
        ("1", "EXPRESS", "Giao nhanh"),
        ("2", "STANDARD", "Giao tiêu chuẩn"),
    ],
    "transaction_type": [
        ("1", "IN", "Tăng tồn, thường dùng cho nhập hoặc hoàn kho"),
        ("2", "OUT", "Giảm tồn, thường dùng cho reserve hoặc xuất"),
    ],
    "product_status": [
        ("1", "OUT OF STOCK", "Hết hàng"),
        ("2", "IMPORTING", "Đang nhập"),
        ("3", "AVAILABLE", "Có thể bán"),
        ("4", "RUNNING OUT", "Sắp hết hàng"),
        ("5", "NEW", "Mới nhập hoặc mới mở bán"),
    ],
    "discount_type": [
        ("1", "PERCENTAGE", "Giảm theo phần trăm"),
        ("2", "FIXED AMOUNT", "Giảm theo số tiền cố định"),
    ],
    "discount_status": [
        ("1", "INACTIVE", "Chưa kích hoạt"),
        ("2", "ACTIVE", "Đang áp dụng"),
        ("3", "EXPIRED", "Hết hạn"),
    ],
    "sale_type": [
        ("1", "PERCENTAGE", "Sale theo phần trăm"),
        ("2", "FIXED AMOUNT", "Sale theo số tiền cố định"),
    ],
    "sale_status": [
        ("1", "INACTIVE", "Chưa hoạt động"),
        ("2", "ACTIVE", "Đang hoạt động"),
        ("3", "EXPIRED", "Hết hạn"),
    ],
    "order_status": [
        ("1", "PENDING", "Đơn vừa tạo, chờ xử lý"),
        ("2", "PROCESSING", "Đã được duyệt, đang chuẩn bị"),
        ("3", "SHIPPING", "Đang giao"),
        ("4", "COMPLETED", "Hoàn tất"),
        ("5", "CANCELLED", "Đã hủy"),
        ("6", "RETURNED", "Đã hoàn trả"),
        ("7", "DENIED", "Bị từ chối"),
        ("8", "INSPECTION", "Đang kiểm tra hàng hoàn"),
        ("9", "RETURNING", "Khách đang yêu cầu trả hàng"),
    ],
    "rank": [
        ("1", "Unranked", "0", "0.00", "0.00"),
        ("2", "Bronze", "1,000,000", "0.02", "Khởi đầu chương trình thành viên"),
        ("3", "Silver", "5,000,000", "0.05", "Mức trung gian"),
        ("4", "Gold", "10,000,000", "0.07", "Mức cao"),
        ("5", "Diamond", "30,000,000", "0.10", "Mức cao nhất trong seed hiện tại"),
    ],
}


table_catalog = [
    {
        "name": "role",
        "domain": "User/Auth",
        "purpose": "Bảng danh mục role để xác định quyền hệ thống như ADMIN, STAFF, CUSTOMER.",
        "pk": "role_id (int)",
        "relations": "1 role -> nhiều user",
        "why": "Tách riêng để tránh hardcode string role trong nhiều nơi và giúp mở rộng actor về sau.",
        "defend": [
            "Role là bảng lookup chứ không phải bảng giao dịch.",
            "Tách role ra giúp thống nhất phân quyền ở backend và frontend."
        ],
    },
    {
        "name": "user",
        "domain": "User/Auth",
        "purpose": "Bảng tài khoản trung tâm, lưu danh tính, role, email, password, phone, avatar, address.",
        "pk": "user_id (UUID)",
        "relations": "nhiều user thuộc 1 role; 1 user có thể có order, cart, review, notification, user_rank",
        "why": "User là thực thể trung tâm nên dùng UUID để ổn định và khó đoán hơn khi expose ra ngoài.",
        "defend": [
            "User là master table cho actor hệ thống.",
            "Những bảng như order, cart, review đều bám theo user."
        ],
    },
    {
        "name": "rank",
        "domain": "User/Auth",
        "purpose": "Định nghĩa các hạng thành viên và ngưỡng chi tiêu tương ứng.",
        "pk": "rank_id (int)",
        "relations": "1 rank -> nhiều user_rank; 1 rank -> nhiều discount theo điều kiện rank",
        "why": "Rank là danh mục nghiệp vụ dùng lại nhiều lần, không nên nhét cứng vào user.",
        "defend": [
            "Rank mô tả luật, còn user_rank mô tả trạng thái của từng user."
        ],
    },
    {
        "name": "user_rank",
        "domain": "User/Auth",
        "purpose": "Lưu hạng hiện tại của từng user, money spent, expire date, status.",
        "pk": "user_id (shared PK / one-to-one)",
        "relations": "1 user <-> 1 user_rank; nhiều user_rank thuộc 1 rank",
        "why": "Tách ra vì trạng thái hạng có lifecycle riêng, có ngày hết hạn và số tiền tích lũy.",
        "defend": [
            "Đây là bảng trạng thái của membership, không phải bảng danh mục rank."
        ],
    },
    {
        "name": "brand",
        "domain": "Catalog",
        "purpose": "Lưu thương hiệu của sản phẩm.",
        "pk": "brand_id (int)",
        "relations": "1 brand -> nhiều product",
        "why": "Nếu để tên brand trong product thì bị lặp dữ liệu và khó cập nhật đồng loạt.",
        "defend": [
            "Brand là master data dùng chung cho nhiều product.",
            "CRUD brand phục vụ dashboard và filter catalog."
        ],
    },
    {
        "name": "category",
        "domain": "Catalog",
        "purpose": "Lưu danh mục phân loại sản phẩm.",
        "pk": "category_id (int)",
        "relations": "nhiều category <-> nhiều product qua product_category",
        "why": "Một product có thể thuộc nhiều category, nên category phải tách riêng.",
        "defend": [
            "Category là taxonomy của catalog.",
            "Tách category giúp mở rộng filter và navigation ở homepage/shop."
        ],
    },
    {
        "name": "product_status",
        "domain": "Catalog",
        "purpose": "Danh mục trạng thái sản phẩm như AVAILABLE, OUT OF STOCK, NEW.",
        "pk": "product_status_id (int)",
        "relations": "1 product_status -> nhiều product",
        "why": "Lookup table giúp state của product đồng nhất và dễ mở rộng.",
        "defend": [
            "Status này mang nghĩa business, không phải boolean đơn giản."
        ],
    },
    {
        "name": "product",
        "domain": "Catalog",
        "purpose": "Thực thể sản phẩm ở mức business như tên, mô tả, brand, product code.",
        "pk": "product_id (UUID)",
        "relations": "1 brand -> nhiều product; product <-> category; 1 product -> nhiều variation",
        "why": "Product là lớp trừu tượng trước khi xuống mức size/màu cụ thể.",
        "defend": [
            "Product không phải SKU cuối cùng; variation mới là mức gần SKU hơn.",
            "Product giữ thông tin chung, variation giữ phần biến đổi."
        ],
    },
    {
        "name": "product_category",
        "domain": "Catalog",
        "purpose": "Bảng nối product với category.",
        "pk": "composite key theo cặp product/category ở mức mô hình",
        "relations": "many-to-many giữa product và category",
        "why": "Một sản phẩm có thể nằm trong nhiều category, ví dụ vừa là Áo vừa là Sale hoặc New Arrival.",
        "defend": [
            "Đây là join table điển hình cho quan hệ nhiều-nhiều.",
            "Nếu chỉ để category_id trong product thì mất tính linh hoạt."
        ],
    },
    {
        "name": "size",
        "domain": "Catalog",
        "purpose": "Danh mục size.",
        "pk": "size_id (int)",
        "relations": "1 size -> nhiều variation",
        "why": "Size là lookup table để đồng nhất dữ liệu thay vì text tự do.",
        "defend": [
            "Lookup giúp tránh lỗi như 'L' và 'Large' bị coi là hai giá trị khác nhau."
        ],
    },
    {
        "name": "color",
        "domain": "Catalog",
        "purpose": "Danh mục màu sắc, có cả tên và mã hex.",
        "pk": "color_id (int)",
        "relations": "1 color -> nhiều variation",
        "why": "Tách màu ra giúp UI render màu chuẩn và tránh text lặp.",
        "defend": [
            "Color phục vụ cả business lẫn presentation ở frontend."
        ],
    },
    {
        "name": "variation",
        "domain": "Catalog",
        "purpose": "Biến thể sản phẩm theo size, color, image và price.",
        "pk": "variation_id (int)",
        "relations": "nhiều variation thuộc 1 product; nhiều variation có stock_variation, cart, transaction, variation_single",
        "why": "Vì giá và tồn kho thường quản lý ở mức biến thể chứ không phải ở mức product chung.",
        "defend": [
            "Variation là lớp gần với SKU.",
            "Mức stock và order nên bám vào variation thay vì product."
        ],
    },
    {
        "name": "variation_single",
        "domain": "Catalog/Order",
        "purpose": "Đại diện cho từng đơn vị item cụ thể của một variation.",
        "pk": "variation_single_id (int)",
        "relations": "nhiều variation_single thuộc 1 variation; variation_single được gắn vào order_variation_single",
        "why": "Thiết kế này cho phép bẻ order ra từng item riêng, snapshot chính xác item đã bán.",
        "defend": [
            "Đây là mức chi tiết hơn variation.",
            "Nếu bị hỏi 'tại sao không chỉ lưu quantity', hãy nói đây là lựa chọn mô hình hóa theo item unit."
        ],
    },
    {
        "name": "stock",
        "domain": "Warehouse",
        "purpose": "Bảng master của warehouse, lưu tên kho và địa chỉ.",
        "pk": "stock_id (int)",
        "relations": "1 stock -> nhiều stock_variation; 1 stock -> nhiều transaction",
        "why": "Kho vật lý là thực thể riêng, không nên trộn lẫn với số lượng tồn.",
        "defend": [
            "Stock chỉ là nơi chứa; tồn thực tế nằm ở stock_variation."
        ],
    },
    {
        "name": "stock_variation",
        "domain": "Warehouse",
        "purpose": "Lưu số lượng tồn của từng variation trong từng warehouse.",
        "pk": "composite key (stock_id, variation_id)",
        "relations": "nhiều stock_variation thuộc 1 stock và 1 variation",
        "why": "Một variation có thể xuất hiện ở nhiều kho; một kho chứa nhiều variation.",
        "defend": [
            "Đây là current state của inventory.",
            "Nếu nhét quantity vào variation thì không biết tồn theo từng warehouse."
        ],
    },
    {
        "name": "provider",
        "domain": "Warehouse",
        "purpose": "Nhà cung cấp hàng cho warehouse/import.",
        "pk": "provider_id (int)",
        "relations": "1 provider -> nhiều transaction nhập kho",
        "why": "Phục vụ audit nguồn gốc nhập hàng và quản lý đối tác cung ứng.",
        "defend": [
            "Provider thường xuất hiện ở import flow và transaction history."
        ],
    },
    {
        "name": "transaction_type",
        "domain": "Warehouse",
        "purpose": "Danh mục loại giao dịch kho như IN và OUT.",
        "pk": "transaction_type_id (int)",
        "relations": "1 transaction_type -> nhiều transaction",
        "why": "Lookup table giúp không hardcode IN/OUT khắp nơi.",
        "defend": [
            "Type tách khỏi transaction để dễ mở rộng thêm loại sau này."
        ],
    },
    {
        "name": "transaction",
        "domain": "Warehouse",
        "purpose": "Lưu lịch sử nhập, xuất, reserve, hoàn kho, điều chỉnh kho.",
        "pk": "transaction_id (int)",
        "relations": "nhiều transaction thuộc stock, variation, provider, employee, transaction_type",
        "why": "Tách history khỏi current stock để hỗ trợ audit, history và truy vết vận hành.",
        "defend": [
            "Stock_variation cho biết đang còn bao nhiêu, transaction cho biết tại sao lại như vậy.",
            "History phải đọc từ transaction chứ không đọc từ stock_variation."
        ],
    },
    {
        "name": "discount_type",
        "domain": "Pricing",
        "purpose": "Phân loại discount theo phần trăm hoặc số tiền cố định.",
        "pk": "discount_type_id (int)",
        "relations": "1 discount_type -> nhiều discount",
        "why": "Vì công thức tính khác nhau nên type phải rõ ràng.",
        "defend": [
            "Type ảnh hưởng trực tiếp tới cách tính savings ở checkout."
        ],
    },
    {
        "name": "discount_status",
        "domain": "Pricing",
        "purpose": "Trạng thái voucher như ACTIVE, INACTIVE, EXPIRED.",
        "pk": "discount_status_id (int)",
        "relations": "1 discount_status -> nhiều discount",
        "why": "Lookup trạng thái giúp filter danh sách voucher và kiểm soát vòng đời voucher.",
        "defend": [
            "Status này không nên thay bằng boolean vì voucher có nhiều trạng thái hơn bật/tắt."
        ],
    },
    {
        "name": "discount",
        "domain": "Pricing",
        "purpose": "Thông tin voucher/discount như code, type, min order, max value, usage limit, date range.",
        "pk": "discount_id (int)",
        "relations": "thuộc 1 discount_type, 1 discount_status; có thể yêu cầu 1 rank; được dùng trong order hoặc user_discount",
        "why": "Discount có nhiều luật nghiệp vụ nên cần bảng riêng thay vì chỉ là vài cột trong order.",
        "defend": [
            "Discount mang tính reusable và có lifecycle riêng.",
            "Order chỉ nên tham chiếu discount đã áp chứ không chứa toàn bộ định nghĩa voucher."
        ],
    },
    {
        "name": "user_discount",
        "domain": "Pricing",
        "purpose": "Bảng nối user với discount, đồng thời track đã dùng hay chưa.",
        "pk": "composite key (discount_id, user_id)",
        "relations": "many-to-many giữa user và discount",
        "why": "Dùng cho private discount hoặc để track usage theo user.",
        "defend": [
            "Một user có thể có nhiều discount, một discount có thể áp cho nhiều user."
        ],
    },
    {
        "name": "sale_type",
        "domain": "Pricing",
        "purpose": "Loại sale theo percentage hoặc fixed amount.",
        "pk": "sale_type_id (int)",
        "relations": "1 sale_type -> nhiều sale",
        "why": "Cùng lý do như discount_type.",
        "defend": [
            "Sale và discount nhìn giống nhau nhưng scope nghiệp vụ khác nhau."
        ],
    },
    {
        "name": "sale_status",
        "domain": "Pricing",
        "purpose": "Trạng thái của chương trình sale.",
        "pk": "sale_status_id (int)",
        "relations": "1 sale_status -> nhiều sale",
        "why": "Giúp backend và dashboard filter sale theo vòng đời.",
        "defend": [
            "Status phục vụ quản trị chiến dịch sale."
        ],
    },
    {
        "name": "sale",
        "domain": "Pricing",
        "purpose": "Định nghĩa chương trình sale, thời gian áp dụng và giá trị sale.",
        "pk": "sale_id (int)",
        "relations": "thuộc 1 sale_type, 1 sale_status; liên kết với product qua sale_product",
        "why": "Sale là chiến dịch áp cho nhiều product, nên không nhét thẳng vào product.",
        "defend": [
            "Sale mô tả chiến dịch, sale_product mô tả sản phẩm nào nằm trong chiến dịch."
        ],
    },
    {
        "name": "sale_product",
        "domain": "Pricing",
        "purpose": "Bảng nối giữa sale và product.",
        "pk": "composite key (sale_id, product_id)",
        "relations": "many-to-many giữa sale và product",
        "why": "Một sale áp nhiều product, và một product có thể tham gia các sale ở những thời điểm khác nhau.",
        "defend": [
            "Đây là join table chuẩn cho many-to-many."
        ],
    },
    {
        "name": "payment_method",
        "domain": "Order",
        "purpose": "Danh mục phương thức thanh toán.",
        "pk": "payment_method_id (int)",
        "relations": "1 payment_method -> nhiều order",
        "why": "Giúp checkout linh hoạt và dễ mở rộng thêm phương thức thanh toán.",
        "defend": [
            "Method ảnh hưởng flow thanh toán và callback."
        ],
    },
    {
        "name": "shipping_method",
        "domain": "Order",
        "purpose": "Danh mục phương thức giao hàng.",
        "pk": "shipping_method_id (int)",
        "relations": "1 shipping_method -> nhiều order",
        "why": "Method giao hàng ảnh hưởng expected delivery date và phí ship trong business logic.",
        "defend": [
            "Shipping method là lookup chứ không nên là string tự do."
        ],
    },
    {
        "name": "order_status",
        "domain": "Order",
        "purpose": "Vòng đời trạng thái của đơn hàng.",
        "pk": "order_status_id (int)",
        "relations": "1 order_status -> nhiều order",
        "why": "Trạng thái đơn hàng là state machine nghiệp vụ nên phải chuẩn hóa bằng lookup.",
        "defend": [
            "Status table giúp dashboard, report và logic chuyển trạng thái đồng nhất."
        ],
    },
    {
        "name": "order",
        "domain": "Order",
        "purpose": "Header của đơn hàng: user, payment, shipping, status, total, address, tracking, employee phụ trách.",
        "pk": "order_id (string UUID generated ở entity)",
        "relations": "thuộc user, payment_method, shipping_method, order_status, discount, incharge_employee; có nhiều order_variation_single",
        "why": "Order header phải tách khỏi detail để mô hình hóa đúng cấu trúc thương mại điện tử.",
        "defend": [
            "Order là hóa đơn tổng quát, detail nằm ở bảng riêng.",
            "Header-detail là pattern chuẩn cho invoice/order."
        ],
    },
    {
        "name": "order_variation_single",
        "domain": "Order",
        "purpose": "Detail của order ở mức từng item unit, lưu item nào thuộc order nào và giá tại thời điểm mua.",
        "pk": "composite key (order_id, variation_single_id)",
        "relations": "nhiều dòng thuộc 1 order và 1 variation_single",
        "why": "Snapshot item và price tại purchase time giúp lịch sử order không bị sai khi giá hiện tại đổi.",
        "defend": [
            "variation_price_at_purchase là điểm defend rất tốt.",
            "Nếu không snapshot giá thì lịch sử đơn sẽ sai."
        ],
    },
    {
        "name": "cart",
        "domain": "Customer Engagement",
        "purpose": "Giỏ hàng của user ở mức variation và quantity.",
        "pk": "composite key (user_id, variation_id)",
        "relations": "nhiều cart item thuộc 1 user và 1 variation",
        "why": "Một user không nên có nhiều dòng trùng cùng variation; composite key chặn duplicate đó.",
        "defend": [
            "Cart lưu trước order, sau checkout thì cart được xóa hoặc dọn."
        ],
    },
    {
        "name": "wishlist",
        "domain": "Customer Engagement",
        "purpose": "Danh sách sản phẩm yêu thích của user.",
        "pk": "ở mức mô hình là cặp user_id/product_id",
        "relations": "many-to-many giữa user và product",
        "why": "Wishlist không cần quantity hay pricing snapshot, chỉ cần quan hệ yêu thích.",
        "defend": [
            "Wishlist đơn giản hơn cart vì chỉ lưu ý thích chứ không liên quan mua bán trực tiếp."
        ],
    },
    {
        "name": "review",
        "domain": "Customer Engagement",
        "purpose": "Đánh giá sản phẩm bởi user, có thể gắn với order đã mua.",
        "pk": "review_id (int)",
        "relations": "thuộc product, user, order; có nhiều comment",
        "why": "Review nên gắn được với order để hỗ trợ verified purchase.",
        "defend": [
            "Đây là lý do review có order_id."
        ],
    },
    {
        "name": "comment",
        "domain": "Customer Engagement",
        "purpose": "Bình luận cho review hoặc phản hồi giữa staff và user.",
        "pk": "comment_id (int)",
        "relations": "thuộc review; quan hệ cây cha-con qua comment_parent",
        "why": "Tách comment ra giúp review có thể có nhiều phản hồi/thread.",
        "defend": [
            "Review là nội dung gốc, comment là hội thoại quanh review."
        ],
    },
    {
        "name": "comment_parent",
        "domain": "Customer Engagement",
        "purpose": "Bảng tự nối để biểu diễn quan hệ cha-con của comment.",
        "pk": "composite key của comment_id và comment_parent_id ở mức code",
        "relations": "self-reference giữa comment và comment",
        "why": "Dùng bảng nối giúp mô hình thread comment linh hoạt hơn một số kiểu nested reply.",
        "defend": [
            "Bảng này phục vụ tree/hierarchy, không phải nội dung comment."
        ],
    },
    {
        "name": "notification",
        "domain": "Customer Engagement",
        "purpose": "Nội dung thông báo được tạo bởi hệ thống hoặc người dùng nội bộ.",
        "pk": "notification_id (int)",
        "relations": "thuộc người gửi; nối tới user qua notification_user",
        "why": "Tách nội dung notification khỏi danh sách người nhận để tái sử dụng thông báo cho nhiều user.",
        "defend": [
            "Notification là message master, notification_user là delivery trạng thái từng user."
        ],
    },
    {
        "name": "notification_user",
        "domain": "Customer Engagement",
        "purpose": "Bảng nối notification với user nhận, đồng thời track viewed/deleted.",
        "pk": "ở mức mô hình là cặp notification_id/user_id",
        "relations": "many-to-many giữa notification và user",
        "why": "Một notification có thể gửi cho nhiều user và mỗi user có trạng thái đọc khác nhau.",
        "defend": [
            "Trạng thái viewed/deleted là thuộc tính của từng người nhận chứ không thuộc notification master."
        ],
    },
]


core_flows = [
    {
        "title": "Search Product và Homepage Listing",
        "actor": "Guest hoặc Customer",
        "goal": "Tìm hoặc duyệt sản phẩm nhanh trong catalog.",
        "frontend": [
            "Trang search: SearchResultsPage.jsx",
            "Trang shop/home gọi Product API để lấy danh sách sản phẩm"
        ],
        "backend": [
            "ProductRestController.findProducts",
            "ProductRestController.searchProducts",
            "ProductService.findProductsWithFilters",
            "ProductService.searchProducts"
        ],
        "tables": ["product", "brand", "category", "product_category", "variation", "sale_product", "sale", "review", "stock_variation"],
        "defend": [
            "Search và homepage list đều lấy ở backend, không lọc tay ở frontend.",
            "Mục tiêu là hỗ trợ query, filter, rating, sort và pagination."
        ],
    },
    {
        "title": "Brand CRUD",
        "actor": "Admin hoặc Staff",
        "goal": "Quản lý thương hiệu trong dashboard.",
        "frontend": [
            "DashboardBrands.js",
            "DashboardCreateBrand.js",
            "DashboardEditBrand.js",
            "DashboardBrandDetailPage.jsx"
        ],
        "backend": [
            "BrandRestController",
            "BrandService",
            "BrandRepository.findAllBrandsWithQuantity"
        ],
        "tables": ["brand", "product", "variation", "stock_variation"],
        "defend": [
            "Brand được tạo/sửa/xóa như master data.",
            "Delete bị chặn khi brand còn linked product để bảo vệ toàn vẹn dữ liệu."
        ],
    },
    {
        "title": "View Warehouse và View Stock",
        "actor": "Admin hoặc Staff",
        "goal": "Biết kho nào đang chứa gì, variation nào sắp hết.",
        "frontend": [
            "DashboardWarehouse.js",
            "DashboardWarehouseDetail.js"
        ],
        "backend": [
            "StockRestController.getStocks",
            "StockRestController.getStockById",
            "StockService.getStockDetails / findPaginatedStockDetails"
        ],
        "tables": ["stock", "stock_variation", "variation", "product", "brand", "category"],
        "defend": [
            "Warehouse master và stock detail tách làm hai màn hình riêng.",
            "Low stock chỉ là một điều kiện lọc trên stock_variation."
        ],
    },
    {
        "title": "Import Product vào Warehouse",
        "actor": "Admin hoặc Staff",
        "goal": "Nhập hàng từ provider vào một warehouse cụ thể.",
        "frontend": [
            "DashboardImportProducts.js",
            "DashboardWarehouseDetail.js dẫn tới màn import"
        ],
        "backend": [
            "StockTransactionRestController.bulkImportTransactions",
            "StockTransactionService.createStockTransactions"
        ],
        "tables": ["provider", "stock", "variation", "transaction", "transaction_type", "stock_variation", "product_status"],
        "defend": [
            "Import vừa tạo transaction IN vừa cập nhật current stock.",
            "Nếu variation chưa có dòng tồn ở warehouse đó thì tạo mới stock_variation."
        ],
    },
    {
        "title": "Adjust Stock",
        "actor": "Admin hoặc Staff",
        "goal": "Điều chỉnh tồn do kiểm kê hoặc sai lệch.",
        "frontend": [
            "DashboardWarehouseDetail.js"
        ],
        "backend": [
            "StockTransactionRestController.adjustStock",
            "StockTransactionService.adjustStockQuantity"
        ],
        "tables": ["stock", "variation", "stock_variation", "transaction", "transaction_type", "user"],
        "defend": [
            "Adjust khác import ở chỗ nó là hiệu chỉnh vận hành, không gắn provider.",
            "Hệ thống vẫn phải tạo transaction để audit được lý do thay đổi tồn."
        ],
    },
    {
        "title": "View Import History / Stock History",
        "actor": "Admin hoặc Staff",
        "goal": "Xem lịch sử kho để audit ai đã nhập/xuất lúc nào.",
        "frontend": [
            "DashboardStockTransactions.js"
        ],
        "backend": [
            "StockTransactionRestController.getStockTransactions",
            "StockTransactionService.getTransactions"
        ],
        "tables": ["transaction", "transaction_type", "stock", "variation", "provider", "user", "product", "brand"],
        "defend": [
            "History đọc từ transaction vì đó là movement log.",
            "Nếu chỉ nhìn stock_variation thì chỉ biết tồn hiện tại, không biết lịch sử."
        ],
    },
    {
        "title": "Place Order",
        "actor": "Customer",
        "goal": "Chuyển cart thành đơn hàng hợp lệ.",
        "frontend": [
            "Checkout.jsx",
            "CheckoutService.js"
        ],
        "backend": [
            "OrderRestController.checkStockAvailability",
            "OrderRestController.createOrder",
            "OrderService.createOrder",
            "OrderService.saveOrderDetails"
        ],
        "tables": ["cart", "order", "order_variation_single", "variation_single", "variation", "discount", "payment_method", "shipping_method", "order_status"],
        "defend": [
            "Luồng chuẩn là check stock trước, rồi tạo order, rồi lưu detail, rồi reserve stock.",
            "Header-detail được lưu tách nhau để đúng cấu trúc thương mại điện tử."
        ],
    },
    {
        "title": "Reserve Stock khi Order được tạo",
        "actor": "Hệ thống",
        "goal": "Giảm tồn ngay khi order được chấp nhận để tránh oversell.",
        "frontend": [
            "Không có màn hình riêng, đây là logic backend trong create order."
        ],
        "backend": [
            "StockTransactionService.createReservationTransactionsForOrder"
        ],
        "tables": ["order", "order_variation_single", "variation_single", "variation", "stock_variation", "transaction"],
        "defend": [
            "Reservation là cầu nối giữa domain order và domain warehouse.",
            "Ở code hiện tại reservation dùng transaction OUT và trừ vào stock_variation."
        ],
    },
    {
        "title": "Payment theo COD, VNPay, Transfer",
        "actor": "Customer",
        "goal": "Thanh toán đơn bằng phương thức phù hợp.",
        "frontend": [
            "Checkout.jsx chọn payment method",
            "OrderSuccess / OrderBankTransfer / OrderFail"
        ],
        "backend": [
            "OrderService.handlePayment",
            "VNPayRestController / VNPayService",
            "PayOsRestController có xuất hiện như một hướng mở rộng"
        ],
        "tables": ["payment_method", "order", "order_status"],
        "defend": [
            "Payment method là lookup tách riêng vì mỗi method có flow khác nhau.",
            "COD không cần redirect, VNPay cần callback, Transfer là chuyển khoản thủ công."
        ],
    },
    {
        "title": "Staff Review Order",
        "actor": "Staff hoặc Admin",
        "goal": "Duyệt hoặc từ chối đơn theo quy trình vận hành.",
        "frontend": [
            "DashboardOrders.js",
            "DashboardOrderDetailPage.jsx"
        ],
        "backend": [
            "OrderRestController.staff-review",
            "OrderService.reviewOrderByStaff"
        ],
        "tables": ["order", "order_status", "user"],
        "defend": [
            "Đây là bước vận hành nội bộ để chuyển đơn từ PENDING sang PROCESSING hoặc SHIPPING.",
            "Incharge employee được lưu ngay trên order để trace ai đang xử lý."
        ],
    },
    {
        "title": "Cancel Order / Return Order / Confirm Receipt",
        "actor": "Customer hoặc Staff tùy bước",
        "goal": "Quản lý hậu xử lý của order sau khi đã tạo.",
        "frontend": [
            "OrderDetail.jsx cho customer",
            "DashboardOrders.js cho staff"
        ],
        "backend": [
            "OrderService.cancelOrder",
            "OrderService.confirmOrderReceived",
            "OrderService.returnOrder",
            "OrderService.inspectOrder",
            "OrderService.orderReturned"
        ],
        "tables": ["order", "order_status", "stock_variation", "transaction", "user_rank"],
        "defend": [
            "Cancel/Return không chỉ là đổi status mà còn tác động warehouse.",
            "Return flow dài hơn vì có bước inspection."
        ],
    },
    {
        "title": "Statistics Dashboard",
        "actor": "Admin hoặc Staff",
        "goal": "Theo dõi doanh thu, trạng thái đơn và best-selling.",
        "frontend": [
            "Dashboard.js",
            "component/chart/*"
        ],
        "backend": [
            "StatisticsRestController",
            "StatisticsService",
            "StatisticsRepository"
        ],
        "tables": ["order", "order_status", "order_variation_single", "variation_single", "product"],
        "defend": [
            "Frontend không tự tính chart mà chỉ render dữ liệu aggregate từ backend.",
            "Statistics là phần đọc dữ liệu chứ không thay đổi dữ liệu."
        ],
    },
    {
        "title": "Profile và Account Self-Service",
        "actor": "Customer hoặc user đang đăng nhập",
        "goal": "Xem, sửa, đổi mật khẩu hoặc tự request disable account.",
        "frontend": [
            "UserSettings.jsx",
            "UserChangePassword",
            "Delete account flow"
        ],
        "backend": [
            "AccountRestController",
            "UserService.updateUserInfo",
            "UserService.updatePassword",
            "UserService.disableAccount"
        ],
        "tables": ["user"],
        "defend": [
            "Profile là self-service nên bám bảng user.",
            "Những thay đổi profile không đi qua domain order hay warehouse."
        ],
    },
]


file_map_rows = [
    ("Warehouse tổng quan", "unleashed-frontend/src/pages/Dashboard/DashboardWarehouse.js", "Xem danh sách warehouse và các thao tác CRUD cơ bản"),
    ("Stock detail", "unleashed-frontend/src/pages/Dashboard/DashboardWarehouseDetail.js", "Filter stock, low stock, adjust stock, dẫn tới import"),
    ("Stock history", "unleashed-frontend/src/pages/Dashboard/DashboardStockTransactions.js", "Màn hình lịch sử transaction"),
    ("Brand list/detail", "unleashed-frontend/src/pages/Dashboard/DashboardBrands.js; DashboardBrandDetailPage.jsx", "CRUD và detail brand"),
    ("Checkout", "unleashed-frontend/src/pages/CartAndPay/Checkout.jsx", "Payload checkout và điều kiện ready"),
    ("Customer order detail", "unleashed-frontend/src/pages/Order/OrderDetail.jsx", "Cancel, confirm receipt, return"),
    ("Dashboard order list/detail", "unleashed-frontend/src/pages/Dashboard/DashboardOrders.js; DashboardOrderDetailPage.jsx", "Staff review và order operations"),
    ("Routes", "unleashed-frontend/src/routes/AppRoutes.js", "Actor nào đi màn nào"),
    ("Product controller/service", "unleashed/src/main/java/com/unleashed/rest/ProductRestController.java; service/ProductService.java", "Search, shop list, variation import listing"),
    ("Brand controller/service", "unleashed/src/main/java/com/unleashed/rest/BrandRestController.java; service/BrandService.java", "Brand CRUD"),
    ("Stock controller/service", "unleashed/src/main/java/com/unleashed/rest/StockRestController.java; service/StockService.java", "Warehouse master và stock detail"),
    ("Stock transaction controller/service", "unleashed/src/main/java/com/unleashed/rest/StockTransactionRestController.java; service/StockTransactionService.java", "Import, adjust, history, reservation/return"),
    ("Order controller/service", "unleashed/src/main/java/com/unleashed/rest/OrderRestController.java; service/OrderService.java", "Toàn bộ order flow"),
    ("Statistics", "unleashed/src/main/java/com/unleashed/rest/StatisticsRestController.java; service/StatisticsService.java; repo/StatisticsRepository.java", "Revenue, status, best-selling"),
    ("Account/Profile", "unleashed/src/main/java/com/unleashed/rest/AccountRestController.java; service/UserService.java", "Profile self-service"),
    ("Security", "unleashed/src/main/java/com/unleashed/security/SecurityConfig.java", "Nắm cách codebase bật method security và JWT filter"),
]


core_table_column_details = {
    "user": {
        "purpose": "Bảng user là trung tâm của actor hệ thống, nên cần đọc ở mức từng cột.",
        "rows": [
            ("user_id", "Khóa chính UUID của user", "Dùng UUID vì đây là thực thể lớn, public-facing và nên khó đoán hơn int tuần tự"),
            ("role_id", "Khóa ngoại sang role", "Tách role ra để phân quyền bằng lookup table thay vì hardcode string"),
            ("is_user_enabled", "Trạng thái kích hoạt tài khoản", "Phục vụ disable account, xác nhận đăng ký, chặn đăng nhập"),
            ("user_google_id", "Mã định danh khi đăng nhập bằng Google", "Tách khỏi username/password để hỗ trợ social login"),
            ("user_username", "Tên đăng nhập nội bộ", "Được dùng trong auth, hiển thị, trace incharge staff"),
            ("user_password", "Mật khẩu đã mã hóa", "Chỉ nên lưu hash, không lưu plain text"),
            ("user_fullname", "Họ tên hiển thị", "Phục vụ UI và email"),
            ("user_email", "Email dùng cho login/forgot/register", "Là kênh liên lạc và xác thực"),
            ("user_phone", "Số điện thoại", "Phục vụ profile và liên hệ"),
            ("user_birthdate", "Ngày sinh dạng text trong codebase hiện tại", "Cho thấy schema hiện thiên về đồ án hơn production-ready typing"),
            ("user_address", "Địa chỉ giao hàng mặc định gần nhất", "Được cập nhật sau checkout để user đỡ nhập lại"),
            ("user_image", "Avatar", "Phục vụ profile UI"),
            ("user_current_payment_method", "Phương thức thanh toán gần nhất", "Giúp checkout nhớ lựa chọn cũ của user"),
            ("user_created_at / user_updated_at", "Thời gian tạo/cập nhật", "Quan trọng cho audit và sắp xếp"),
        ],
    },
    "product": {
        "purpose": "Product là thực thể business chung, chưa đi xuống mức size/màu.",
        "rows": [
            ("product_id", "Khóa chính UUID của product", "Ổn định và phù hợp với thực thể lớn"),
            ("brand_id", "Khóa ngoại sang brand", "Một brand có nhiều product"),
            ("product_status_id", "Khóa ngoại sang product_status", "Phục vụ trạng thái kinh doanh như AVAILABLE, NEW"),
            ("product_name", "Tên sản phẩm", "Nội dung hiển thị chính cho catalog"),
            ("product_code", "Mã business của sản phẩm", "Dùng cho trace và một số query/statistics"),
            ("product_description", "Mô tả sản phẩm", "Nội dung marketing/chi tiết"),
            ("product_created_at / product_updated_at", "Mốc thời gian", "Hỗ trợ sort, audit, dashboard"),
        ],
    },
    "variation": {
        "purpose": "Variation là lớp gần SKU, nơi gắn size, color, image, price.",
        "rows": [
            ("variation_id", "Khóa chính của variation", "Được dùng xuyên suốt cart, stock, order"),
            ("product_id", "Khóa ngoại sang product", "Nhiều variation thuộc một product"),
            ("size_id", "Khóa ngoại sang size", "Chuẩn hóa size"),
            ("color_id", "Khóa ngoại sang color", "Chuẩn hóa màu"),
            ("variation_image", "Ảnh đại diện cho biến thể", "Cần khi cùng product nhưng màu khác ảnh khác"),
            ("variation_price", "Giá của biến thể", "Giá có thể khác theo variation nên không đặt ở product"),
        ],
    },
    "variation_single": {
        "purpose": "Variation_single là mức item unit được bẻ riêng ra khỏi variation.",
        "rows": [
            ("variation_single_id", "Khóa chính của item unit", "Cho phép gắn từng đơn vị hàng vào order"),
            ("variation_id", "Khóa ngoại sang variation", "Item unit vẫn thuộc về một variation gốc"),
            ("variation_single_code", "Mã riêng của từng item unit trong schema SQL", "Có thể dùng cho trace sâu hơn hoặc seed/test data"),
            ("is_variation_single_bought", "Đánh dấu item unit đã được bán", "Phản ánh mô hình item-level thay vì chỉ quantity"),
        ],
    },
    "stock": {
        "purpose": "Stock là master data của warehouse.",
        "rows": [
            ("stock_id", "Khóa chính kho", "Dùng để định danh warehouse"),
            ("stock_name", "Tên kho", "Hiển thị ở dashboard"),
            ("stock_address", "Địa chỉ kho", "Phục vụ vận hành và phân biệt warehouse"),
        ],
    },
    "stock_variation": {
        "purpose": "Current inventory state theo warehouse và variation.",
        "rows": [
            ("stock_id", "Một vế của composite key", "Cho biết số tồn này nằm ở kho nào"),
            ("variation_id", "Vế còn lại của composite key", "Cho biết đang nói tới variation nào"),
            ("stock_quantity", "Số lượng tồn hiện tại", "Đây là current state chứ không phải history"),
        ],
    },
    "transaction": {
        "purpose": "Movement history của warehouse.",
        "rows": [
            ("transaction_id", "Khóa chính transaction", "Mỗi biến động kho là một event riêng"),
            ("stock_id", "Kho nơi event xảy ra", "Cần để biết movement diễn ra ở đâu"),
            ("variation_id", "Variation bị tác động", "Kết nối transaction với catalog"),
            ("provider_id", "Nhà cung cấp liên quan", "Có ý nghĩa trong import"),
            ("incharge_employee_id", "Nhân sự phụ trách", "Audit ai thao tác"),
            ("transaction_type_id", "IN hay OUT", "Biểu diễn chiều biến động tồn"),
            ("transaction_quantity", "Số lượng tăng/giảm", "Kết hợp với type để hiểu movement"),
            ("transaction_date", "Thời điểm giao dịch", "Cột lõi của history"),
            ("transaction_product_price", "Giá variation tại thời điểm event", "Phục vụ hiển thị/history"),
            ("transaction_note", "Lý do điều chỉnh trong schema", "Hữu ích với adjust stock và giải thích vì sao tồn đổi"),
        ],
    },
    "order": {
        "purpose": "Order header của hệ thống thương mại điện tử.",
        "rows": [
            ("order_id", "Khóa chính đơn hàng", "Định danh order"),
            ("user_id", "Khóa ngoại user đặt đơn", "Cho biết chủ sở hữu đơn"),
            ("order_status_id", "Khóa ngoại sang vòng đời status", "Điều khiển state machine của order"),
            ("payment_method_id", "Khóa ngoại thanh toán", "Quyết định flow COD/VNPay/Transfer"),
            ("shipping_method_id", "Khóa ngoại giao hàng", "Ảnh hưởng expected delivery"),
            ("discount_id", "Voucher áp vào đơn", "Không phải lúc nào cũng có"),
            ("incharge_employee_id", "Nhân sự đang phụ trách đơn", "Hỗ trợ dashboard vận hành"),
            ("order_date", "Ngày tạo đơn", "Mốc nghiệp vụ chính"),
            ("order_total_amount", "Tổng giá trị đơn", "Phục vụ checkout và statistics"),
            ("order_tracking_number", "Mã theo dõi giao hàng", "Phục vụ user và dashboard"),
            ("order_note", "Ghi chú đơn", "Thông tin phụ từ customer hoặc staff"),
            ("order_billing_address", "Địa chỉ nhận hàng", "Snapshot địa chỉ tại thời điểm order"),
            ("order_expected_delivery_date", "Ngày giao dự kiến", "Phụ thuộc shipping method"),
            ("order_transaction_reference", "Mã tham chiếu thanh toán", "Phục vụ payment flow"),
            ("order_tax", "Thuế", "Cột tính tiền mở rộng"),
            ("order_created_at / order_updated_at", "Timestamp hệ thống", "Audit và sort"),
        ],
    },
    "order_variation_single": {
        "purpose": "Order detail ở mức item unit.",
        "rows": [
            ("order_id", "Vế composite key trỏ về order", "Biết item thuộc đơn nào"),
            ("variation_single_id", "Vế composite key trỏ về item unit", "Biết item unit nào đã được bán"),
            ("sale_id", "Sale liên quan nếu có", "Liên kết với chương trình sale tại thời điểm mua"),
            ("variation_price_at_purchase", "Giá snapshot lúc mua", "Cột defend rất mạnh vì tránh sai lịch sử khi giá hiện tại thay đổi"),
        ],
    },
    "discount": {
        "purpose": "Định nghĩa voucher/discount.",
        "rows": [
            ("discount_id", "Khóa chính discount", "Dùng để định danh voucher"),
            ("discount_status_id", "Trạng thái voucher", "Active / inactive / expired"),
            ("discount_type_id", "Loại voucher", "Percentage hay fixed amount"),
            ("discount_code", "Mã voucher", "Customer nhập khi checkout"),
            ("discount_value", "Giá trị giảm", "Phụ thuộc vào type để diễn giải"),
            ("discount_description", "Mô tả voucher", "Giúp UI giải thích cho user"),
            ("discount_rank_requirement", "Yêu cầu rank", "Cho phép voucher chỉ áp với user rank nhất định"),
            ("discount_minimum_order_value", "Giá trị đơn tối thiểu", "Business rule để áp voucher"),
            ("discount_maximum_value", "Trần số tiền giảm", "Đặc biệt cần với percentage"),
            ("discount_usage_limit / discount_usage_count", "Giới hạn và số lần đã dùng", "Dùng cho kiểm soát voucher"),
            ("discount_start_date / discount_end_date", "Khoảng thời gian hiệu lực", "Vòng đời voucher"),
        ],
    },
    "cart": {
        "purpose": "Nơi giữ intent mua hàng trước checkout.",
        "rows": [
            ("user_id", "Một vế composite key", "Mỗi giỏ hàng thuộc một user"),
            ("variation_id", "Vế còn lại", "Cart theo variation chứ không theo product chung"),
            ("cart_quantity", "Số lượng user muốn mua", "Không phải current stock"),
        ],
    },
    "review": {
        "purpose": "Đánh giá sau mua hàng.",
        "rows": [
            ("review_id", "Khóa chính review", "Mỗi review là một bản ghi riêng"),
            ("product_id", "Product được đánh giá", "Review gắn product"),
            ("user_id", "Người đánh giá", "Ai viết review"),
            ("order_id", "Đơn liên quan", "Ràng buộc verified purchase"),
            ("review_rating", "Điểm rating", "Dùng cho aggregate rating"),
        ],
    },
    "notification_user": {
        "purpose": "Delivery state của notification cho từng user.",
        "rows": [
            ("notification_id", "Notification master", "Nội dung nào được gửi"),
            ("user_id", "Người nhận", "Ai nhận notification"),
            ("is_notification_viewed", "Đã xem chưa", "Trạng thái riêng theo user"),
            ("is_notification_deleted", "Đã ẩn/xóa chưa", "Trạng thái riêng theo user"),
        ],
    },
}


foreign_key_rows = [
    ("user.role_id", "role.role_id", "Many users -> one role", "Một role có thể gán cho nhiều user"),
    ("user_rank.user_id", "user.user_id", "One-to-one", "Tách trạng thái rank ra khỏi user"),
    ("user_rank.rank_id", "rank.rank_id", "Many user_rank -> one rank", "Nhiều user có thể cùng rank"),
    ("product.brand_id", "brand.brand_id", "Many products -> one brand", "Tách master thương hiệu"),
    ("product.product_status_id", "product_status.product_status_id", "Many products -> one product_status", "Chuẩn hóa trạng thái product"),
    ("product_category.product_id", "product.product_id", "Join table", "Nối many-to-many product/category"),
    ("product_category.category_id", "category.category_id", "Join table", "Nối many-to-many product/category"),
    ("variation.product_id", "product.product_id", "Many variations -> one product", "Một product có nhiều size/màu"),
    ("variation.size_id", "size.size_id", "Many variations -> one size", "Chuẩn hóa size"),
    ("variation.color_id", "color.color_id", "Many variations -> one color", "Chuẩn hóa màu"),
    ("variation_single.variation_id", "variation.variation_id", "Many item units -> one variation", "Bẻ variation thành item unit"),
    ("stock_variation.stock_id", "stock.stock_id", "Composite key branch", "Tồn theo từng kho"),
    ("stock_variation.variation_id", "variation.variation_id", "Composite key branch", "Tồn theo từng variation"),
    ("transaction.stock_id", "stock.stock_id", "Many transactions -> one stock", "Biết event xảy ra ở kho nào"),
    ("transaction.variation_id", "variation.variation_id", "Many transactions -> one variation", "Biết hàng nào biến động"),
    ("transaction.provider_id", "provider.provider_id", "Many transactions -> one provider", "Trace nguồn nhập"),
    ("transaction.incharge_employee_id", "user.user_id", "Many transactions -> one user", "Audit ai thao tác"),
    ("transaction.transaction_type_id", "transaction_type.transaction_type_id", "Many transactions -> one type", "IN/OUT"),
    ("discount.discount_status_id", "discount_status.discount_status_id", "Many discounts -> one status", "Lookup trạng thái voucher"),
    ("discount.discount_type_id", "discount_type.discount_type_id", "Many discounts -> one type", "Lookup loại voucher"),
    ("discount.discount_rank_requirement", "rank.rank_id", "Many discounts -> one rank requirement", "Voucher có thể đòi hỏi hạng"),
    ("user_discount.user_id", "user.user_id", "Join table", "Nối voucher với user"),
    ("user_discount.discount_id", "discount.discount_id", "Join table", "Nối voucher với user"),
    ("sale.sale_type_id", "sale_type.sale_type_id", "Many sales -> one sale_type", "Lookup loại sale"),
    ("sale.sale_status_id", "sale_status.sale_status_id", "Many sales -> one sale_status", "Lookup trạng thái sale"),
    ("sale_product.sale_id", "sale.sale_id", "Join table", "Nối sale và product"),
    ("sale_product.product_id", "product.product_id", "Join table", "Nối sale và product"),
    ("order.user_id", "user.user_id", "Many orders -> one user", "Mỗi đơn có một customer"),
    ("order.order_status_id", "order_status.order_status_id", "Many orders -> one status", "State machine của đơn"),
    ("order.payment_method_id", "payment_method.payment_method_id", "Many orders -> one payment method", "Flow thanh toán"),
    ("order.shipping_method_id", "shipping_method.shipping_method_id", "Many orders -> one shipping method", "Flow giao hàng"),
    ("order.discount_id", "discount.discount_id", "Many orders -> one discount", "Voucher áp vào đơn"),
    ("order.incharge_employee_id", "user.user_id", "Many orders -> one staff/admin", "Trace ai đang xử lý đơn"),
    ("order_variation_single.order_id", "order.order_id", "Detail -> header", "Header-detail pattern"),
    ("order_variation_single.variation_single_id", "variation_single.variation_single_id", "Detail -> item unit", "Gắn item unit vào order"),
    ("cart.user_id", "user.user_id", "Cart owner", "Giỏ hàng thuộc user"),
    ("cart.variation_id", "variation.variation_id", "Cart item", "Cart lưu theo variation"),
    ("wishlist.user_id", "user.user_id", "Wishlist owner", "Danh sách yêu thích thuộc user"),
    ("wishlist.product_id", "product.product_id", "Wishlist target", "Wishlist theo product"),
    ("review.product_id", "product.product_id", "Review target", "Review gắn product"),
    ("review.user_id", "user.user_id", "Review owner", "Ai viết review"),
    ("review.order_id", "order.order_id", "Verified purchase link", "Gắn review với đơn mua"),
    ("comment.review_id", "review.review_id", "Comment belongs to review", "Hội thoại quanh review"),
    ("comment_parent.comment_id", "comment.comment_id", "Self relation", "Thread comment"),
    ("comment_parent.comment_parent_id", "comment.comment_id", "Self relation", "Thread comment"),
    ("notification.user_id_sender", "user.user_id", "Many notifications -> one sender", "Ai tạo notification"),
    ("notification_user.notification_id", "notification.notification_id", "Join table", "Notification gửi cho user nào"),
    ("notification_user.user_id", "user.user_id", "Join table", "Notification gửi cho user nào"),
]


endpoint_rows = [
    ("GET", "/api/products", "Guest, Customer", "Lấy danh sách sản phẩm có filter/search/sort/pagination", "ProductRestController.findProducts -> ProductService.findProductsWithFilters"),
    ("GET", "/api/products/search", "Guest, Customer", "Search sản phẩm theo query", "ProductRestController.searchProducts -> ProductService.searchProducts"),
    ("GET", "/api/products/all", "Admin, Staff", "Lấy variation list phục vụ import hàng", "ProductRestController.getAllVariations -> ProductService.findAllVariationsForImport"),
    ("GET", "/api/brands", "Admin, Staff", "Xem danh sách brand", "BrandRestController.getAllBrands -> BrandService.getAllBrandsWithQuantity"),
    ("GET", "/api/brands/{id}", "Admin, Staff", "Xem chi tiết brand", "BrandRestController.getBrandById"),
    ("POST", "/api/brands", "Admin", "Tạo brand", "BrandRestController.createBrand -> BrandService.createBrand"),
    ("PUT", "/api/brands/{id}", "Admin, Staff", "Sửa brand", "BrandRestController.updateBrand -> BrandService.updateBrand"),
    ("DELETE", "/api/brands/{id}", "Admin", "Xóa brand", "BrandRestController.deleteBrand -> BrandService.deleteBrand"),
    ("GET", "/api/stocks", "Admin, Staff", "Xem danh sách warehouse", "StockRestController.getStocks -> StockService.findAll"),
    ("GET", "/api/stocks/info/{id}", "Admin, Staff", "Lấy thông tin header của warehouse", "StockRestController.getStockInfoById"),
    ("GET", "/api/stocks/{id}", "Admin, Staff", "Lấy stock detail theo warehouse có filter", "StockRestController.getStockById -> StockService.findPaginatedStockDetails"),
    ("POST", "/api/stocks", "Admin, Staff", "Tạo warehouse", "StockRestController.createStock -> StockService.create"),
    ("PUT", "/api/stocks/{id}", "Admin, Staff", "Sửa warehouse", "StockRestController.updateStock -> StockService.update"),
    ("DELETE", "/api/stocks/{id}", "Admin, Staff", "Xóa warehouse", "StockRestController.deleteStock -> StockService.deleteById"),
    ("GET", "/api/stock-transactions", "Admin, Staff", "Xem lịch sử stock history", "StockTransactionRestController.getStockTransactions -> StockTransactionService.getTransactions"),
    ("POST", "/api/stock-transactions", "Admin, Staff", "Import hàng vào warehouse", "StockTransactionRestController.bulkImportTransactions -> StockTransactionService.createStockTransactions"),
    ("POST", "/api/stock-transactions/adjust", "Admin, Staff", "Điều chỉnh tồn", "StockTransactionRestController.adjustStock -> StockTransactionService.adjustStockQuantity"),
    ("POST", "/api/orders/check-stock", "Customer", "Kiểm tra stock trước checkout", "OrderRestController.checkStockAvailability -> OrderService.checkStockAvailability"),
    ("POST", "/api/orders", "Customer", "Tạo order", "OrderRestController.createOrder -> OrderService.createOrder"),
    ("GET", "/api/orders/my-orders", "Customer", "Xem order history của mình", "OrderRestController.getOrdersForCurrentUser"),
    ("GET", "/api/orders/me/{id}", "Customer", "Xem chi tiết order của mình", "OrderRestController.getMyOrderById"),
    ("GET", "/api/orders", "Admin, Staff", "Xem order list dashboard", "OrderRestController.getOrders"),
    ("GET", "/api/orders/{id}", "Admin, Staff", "Xem order detail dashboard", "OrderRestController.getOrderById"),
    ("PUT", "/api/orders/{orderId}/staff-review", "Admin, Staff", "Duyệt hoặc từ chối order", "OrderService.reviewOrderByStaff"),
    ("PUT", "/api/orders/{orderId}/confirm-receipt", "Customer", "Xác nhận đã nhận hàng", "OrderService.confirmOrderReceived"),
    ("PUT", "/api/orders/{orderId}/cancel", "Customer", "Hủy đơn", "OrderService.cancelOrder"),
    ("PUT", "/api/orders/{orderId}/return", "Customer", "Yêu cầu trả hàng", "OrderService.returnOrder"),
    ("PUT", "/api/orders/{orderId}/inspect", "Admin, Staff", "Chuyển đơn trả hàng sang inspection", "OrderService.inspectOrder"),
    ("PUT", "/api/orders/{orderId}/returned", "Admin, Staff", "Hoàn tất return", "OrderService.orderReturned"),
    ("POST", "/api/orders/{orderId}/payment-callback", "Customer/System callback", "Xử lý callback thanh toán", "OrderService.handlePaymentCallback"),
    ("GET", "/api/statistics/revenue/monthly", "Admin, Staff", "Doanh thu theo ngày trong tháng", "StatisticsRestController.monthlyRevenue"),
    ("GET", "/api/statistics/revenue/yearly", "Admin, Staff", "Tổng doanh thu theo năm", "StatisticsRestController.yearlyRevenue"),
    ("GET", "/api/statistics/order-status-list", "Admin, Staff", "Danh sách status order cho dashboard", "StatisticsRestController.getOrderStatusList"),
    ("GET", "/api/statistics/best-selling-products", "Admin, Staff", "Top bán chạy theo số ngày gần đây", "StatisticsRestController.getBestSellingProducts"),
    ("GET", "/api/statistics/best-selling-products/all-time", "Admin, Staff", "Top bán chạy all time", "StatisticsRestController.getAllTimeBestSellingProducts"),
    ("GET", "/api/account/me", "Customer, Staff, Admin", "Xem profile của chính mình", "AccountRestController.getMyInfo"),
    ("PUT", "/api/account", "Customer, Admin", "Sửa profile", "AccountRestController.updateUserInfo -> UserService.updateUserInfo"),
    ("POST", "/api/account/request-delete", "Customer", "Tự disable account", "AccountRestController.requestDeleteAccount"),
    ("POST", "/api/auth/login", "Guest", "Đăng nhập", "AuthRestController.login"),
    ("POST", "/api/auth/register", "Guest", "Đăng ký", "AuthRestController.register"),
    ("POST", "/api/auth/forgot-password", "Guest", "Gửi email reset password", "AuthRestController.forgotPassword"),
]


query_pattern_rows = [
    {
        "title": "Brand list with total quantity",
        "why": "Dashboard brand list không chỉ cần tên brand mà còn cần tổng lượng hàng liên quan.",
        "sql": [
            "SELECT b.brand_id, b.brand_name, COALESCE(SUM(sp.stock_quantity), 0) AS total_quantity",
            "FROM brand b",
            "LEFT JOIN product p ON b.brand_id = p.brand_id",
            "LEFT JOIN variation v ON p.product_id = v.product_id",
            "LEFT JOIN stock_variation sp ON v.variation_id = sp.variation_id",
            "GROUP BY b.brand_id, b.brand_name",
            "ORDER BY b.brand_id;"
        ],
        "tables": "brand, product, variation, stock_variation",
        "defend": "Left join để brand vẫn hiện ngay cả khi chưa có hàng; SUM để cộng tồn theo tất cả variation thuộc brand."
    },
    {
        "title": "Warehouse stock detail",
        "why": "Màn warehouse detail phải ghép dữ liệu warehouse với variation, brand, category và quantity.",
        "sql": [
            "SELECT ... FROM stock s",
            "LEFT JOIN stock_variation sv ON s.stock_id = sv.stock_id",
            "LEFT JOIN variation v ON sv.variation_id = v.variation_id",
            "LEFT JOIN product p ON v.product_id = p.product_id",
            "LEFT JOIN brand b ON p.brand_id = b.brand_id",
            "LEFT JOIN product_category pc ON p.product_id = pc.product_id",
            "LEFT JOIN category c ON pc.category_id = c.category_id",
            "WHERE s.stock_id = :stockId"
        ],
        "tables": "stock, stock_variation, variation, product, brand, category",
        "defend": "Đây là query kiểu dashboard detail: một màn hình nhưng phải tổng hợp dữ liệu từ nhiều bảng."
    },
    {
        "title": "Monthly daily revenue",
        "why": "Dashboard revenue chart cần doanh thu từng ngày trong tháng chứ không chỉ tổng tháng.",
        "sql": [
            "SELECT CAST(order_date AS DATE) AS order_day, SUM(order_total_amount)",
            "FROM [order]",
            "WHERE MONTH(order_date) = :month AND YEAR(order_date) = :year",
            "GROUP BY CAST(order_date AS DATE)",
            "ORDER BY CAST(order_date AS DATE);"
        ],
        "tables": "order",
        "defend": "CAST về DATE để gom theo ngày, bỏ phần giờ phút giây khỏi timestamp."
    },
    {
        "title": "Order status statistics",
        "why": "Dashboard cần đếm số đơn theo trạng thái để theo dõi vận hành.",
        "sql": [
            "SELECT o.order_status, COUNT(o.order_status)",
            "FROM [order] o",
            "GROUP BY o.order_status;"
        ],
        "tables": "order, order_status",
        "defend": "Status statistics là aggregate rất cơ bản: group by trạng thái rồi count."
    },
    {
        "title": "Best-selling product",
        "why": "Muốn biết bán chạy thì phải đếm item đã bán ở order detail chứ không nhìn product master.",
        "sql": [
            "WITH ProductSales AS (",
            "  SELECT p.product_name, COUNT(ovs.variation_single_id) AS total_sold",
            "  FROM product p",
            "  JOIN variation_single vs ON ...",
            "  JOIN order_variation_single ovs ON vs.variation_single_id = ovs.variation_single_id",
            "  JOIN [order] o ON ovs.order_id = o.order_id",
            "  WHERE o.order_date >= DATEADD(day, -:number_of_days, GETDATE())",
            "  GROUP BY p.product_name",
            ")",
            "SELECT TOP (:top_n_products) product_name, total_sold FROM ProductSales ORDER BY total_sold DESC;"
        ],
        "tables": "product, variation_single, order_variation_single, order",
        "defend": "Best-selling luôn phải đọc từ order detail hoặc item sold, không đọc từ product table."
    },
    {
        "title": "Product search and filter",
        "why": "Search/product listing phải xử lý ở backend để hỗ trợ pagination, sort, brand, category, rating.",
        "sql": [
            "SELECT ... FROM product p",
            "JOIN variation v ON ...",
            "LEFT JOIN brand b ON ...",
            "LEFT JOIN review r ON ...",
            "WHERE query/category/brand/rating/inStock conditions",
            "ORDER BY price asc|desc or default"
        ],
        "tables": "product, variation, brand, review, stock_variation",
        "defend": "Search thực tế thường là query nhiều bảng, không phải chỉ SELECT * FROM product."
    },
]


tradeoff_rows = [
    ("Tại sao tách brand khỏi product?", "Brand là master data dùng chung", "Để brand name trong product", "Giảm lặp dữ liệu và dễ CRUD thương hiệu", "Nếu code nhỏ hơn nữa thì nhét text vào product sẽ nhanh nhưng khó bảo trì"),
    ("Tại sao tách product với variation?", "Product là business item, variation là size/màu cụ thể", "Chỉ có một bảng product với size/color là cột text", "Hỗ trợ nhiều variation và quản lý giá/tồn ở mức biến thể", "Mô hình này phức tạp hơn nhưng đúng e-commerce hơn"),
    ("Tại sao có variation_single?", "Model item unit", "Chỉ lưu quantity ở order detail", "Cho phép trace item sold sâu hơn và snapshot rõ hơn", "Đổi lại schema và code phức tạp hơn"),
    ("Tại sao stock tách khỏi stock_variation?", "Kho và tồn kho là hai khái niệm khác nhau", "Nhét quantity vào stock hoặc variation", "Quản lý tồn theo từng kho và variation", "Cần join nhiều hơn"),
    ("Tại sao transaction tách khỏi stock_variation?", "Current state khác history", "Chỉ lưu quantity hiện tại", "Audit được movement", "Tăng số bảng và logic ghi dữ liệu"),
    ("Tại sao order có header/detail?", "Pattern thương mại điện tử chuẩn", "Một bảng order chứa hết mọi item bằng cột lặp", "Mở rộng tốt, query/report dễ hơn", "Cần join khi xem chi tiết"),
    ("Tại sao dùng lookup table cho status/type?", "Status là domain concept", "Lưu string tự do trong bảng chính", "Nhất quán và dễ mở rộng", "Phải join để lấy tên hiển thị"),
    ("Tại sao user_rank tách khỏi user?", "Membership state có lifecycle riêng", "Thêm vài cột rank vào user", "Giữ user gọn, rank logic rõ", "Thêm một lớp join"),
    ("Tại sao user_discount và sale_product là join table?", "Đều là many-to-many", "Nhét mảng ID hoặc text", "Chuẩn hóa dữ liệu và query/report tốt hơn", "Schema dài hơn"),
    ("Tại sao statistics tính ở backend?", "Aggregate gần DB hơn", "Frontend tự tính từ danh sách raw", "Đúng dữ liệu và hiệu năng hơn", "Backend query phức tạp hơn"),
    ("Tại sao dùng UUID cho user/product?", "Khó đoán, ổn định khi expose", "Dùng int identity", "Tốt hơn cho entity lớn public-facing", "Join và nhìn raw SQL có thể dài hơn"),
    ("Tại sao lưu variation_price_at_purchase?", "Snapshot giá lúc mua", "Join về variation_price hiện tại", "Lịch sử order không bị sai khi giá đổi", "Phải nhớ set giá snapshot khi tạo order"),
]


extra_qa_items = [
    ("Master data là gì?", "Là dữ liệu dùng chung và ít thay đổi như brand, category, stock, provider, payment method."),
    ("Lookup data là gì?", "Là bảng danh mục chuẩn hóa như role, order_status, transaction_type, sale_type."),
    ("Transaction data là gì?", "Là dữ liệu phát sinh theo sự kiện như order, order detail, transaction kho."),
    ("Current state là gì?", "Là trạng thái hiện tại của dữ liệu, ví dụ stock_quantity đang còn bao nhiêu."),
    ("History data là gì?", "Là lịch sử biến động dẫn tới current state, ví dụ transaction nhập/xuất kho."),
    ("Tại sao current state và history nên tách nhau?", "Để query hiện tại nhanh hơn và history audit rõ hơn."),
    ("Business key là gì?", "Là khóa mang nghĩa nghiệp vụ, ví dụ cặp user_id + variation_id trong cart."),
    ("Composite key hợp khi nào?", "Khi bản chất uniqueness là một cặp hoặc bộ cột, không cần id surrogate riêng."),
    ("Surrogate key là gì?", "Là khóa sinh nhân tạo như identity hoặc UUID chỉ để định danh kỹ thuật."),
    ("FetchType.EAGER nghĩa là gì?", "Khi load entity sẽ kéo luôn entity liên quan; đọc thuận tiện hơn nhưng dễ nặng hơn."),
    ("FetchType.LAZY nghĩa là gì?", "Chỉ load quan hệ khi cần, tiết kiệm hơn nhưng phải cẩn thận context/serialization."),
    ("@MapsId dùng khi nào?", "Khi foreign key đồng thời là một phần của composite key."),
    ("One-to-one shared primary key nghĩa là gì?", "Ví dụ user_rank dùng chính user_id làm khóa chính và khóa ngoại sang user."),
    ("Tại sao review gắn product chứ không gắn variation?", "Đồ án này review ở mức product-level để UI đơn giản hơn."),
    ("Tại sao cart gắn variation chứ không gắn product?", "Vì người mua phải chọn size/màu cụ thể trước khi mua."),
    ("Tại sao wishlist gắn product thay vì variation?", "Wishlist thường lưu ý thích chung với sản phẩm, chưa bắt buộc chọn size/màu."),
    ("Tại sao provider chỉ liên quan mạnh tới transaction hơn là product?", "Vì provider trong flow này được dùng cho nhập kho và trace nguồn nhập thực tế."),
    ("Tại sao incharge_employee có ở order và transaction?", "Order cần biết ai phụ trách đơn, transaction cần biết ai thao tác kho."),
    ("Tracking number dùng để làm gì?", "Để theo dõi giao hàng và làm mã hiển thị thân thiện hơn cho user."),
    ("Transaction reference khác tracking number thế nào?", "Tracking number phục vụ logistics, transaction reference phục vụ payment/reference flow."),
    ("Expected delivery date được tính từ đâu?", "Thường từ shipping method và logic service khi tạo order."),
    ("Tại sao user_current_payment_method có trong user?", "Để nhớ lựa chọn gần nhất cho checkout về sau."),
    ("Tại sao product_code có trong product?", "Phục vụ định danh business, import/export hoặc một số join/report."),
    ("Tại sao color có hex code?", "Để frontend hiển thị màu trực quan, không chỉ text name."),
    ("Tại sao category và brand đều là master data nhưng tách hai bảng khác nhau?", "Vì một cái là taxonomy, một cái là thương hiệu; hai khái niệm nghiệp vụ khác nhau."),
    ("Tại sao order status cần nhiều hơn cancelled/completed?", "Vì quy trình vận hành thực tế có nhiều bước như pending, processing, shipping, returning, inspection."),
    ("Tại sao return flow dài hơn cancel flow?", "Vì return xảy ra sau bán, có thể cần kiểm tra hàng hoàn nên thêm inspection."),
    ("Tại sao warehouse detail cần filter brand/category/search/low stock?", "Vì dashboard vận hành cần tìm nhanh mặt hàng cần xử lý chứ không chỉ xem raw list."),
    ("Tại sao best-selling không lấy từ stock giảm?", "Vì stock có thể giảm do nhiều lý do khác ngoài bán hàng; best-selling phải dựa vào order detail."),
    ("Tại sao revenue không lấy từ payment transaction riêng?", "Ở schema hiện tại order là nguồn tổng hợp chính cho doanh thu business."),
    ("Tại sao sale và discount cùng tồn tại?", "Sale là chiến dịch giá ở cấp product, discount là voucher/code ở cấp checkout hoặc user."),
    ("Tại sao disable account dùng cờ enabled thay vì xóa ngay row user?", "Giữ lịch sử dữ liệu và tránh làm hỏng foreign key với order/review."),
    ("Tại sao order detail không gắn trực tiếp variation mà qua variation_single?", "Vì codebase model item-level, không chỉ quantity-level."),
    ("Tại sao stock transaction có product price?", "Để history có thể hiển thị giá tham chiếu của variation tại thời điểm event."),
    ("Tại sao dashboard dùng nhiều aggregate query thay vì load hết raw data?", "Vì aggregate ở DB đúng và hiệu quả hơn."),
    ("Tại sao `use case` không đồng nghĩa với `API endpoint`?", "Một use case có thể dùng nhiều API hoặc nhiều bước, còn endpoint chỉ là điểm gọi kỹ thuật."),
    ("Tại sao frontend route và backend role đều quan trọng?", "Frontend ẩn/hiện màn hình, backend mới là nơi bảo vệ dữ liệu và nghiệp vụ thật sự."),
    ("Tại sao service là chỗ tốt nhất để defend business rule?", "Vì đó là lớp quyết định logic chứ không phải UI hoặc raw query."),
    ("Tại sao bảng join đôi khi không có nhiều cột ngoài khóa?", "Vì nhiệm vụ duy nhất của nó là biểu diễn quan hệ nhiều-nhiều."),
    ("Khi nào join table có thêm thuộc tính riêng?", "Khi quan hệ đó tự nó có ý nghĩa business, ví dụ user_discount có is_discount_used."),
]


def add_title_page(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("AN DEFEND STUDY GUIDE V2 EXTENDED")
    run.bold = True
    run.font.size = Pt(24)
    run.font.name = "Times New Roman"

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Unleashed Project - Ban ôn tập siêu dài cho scope stock / warehouse / order / statistics / brand / profile")
    run.italic = True
    run.font.size = Pt(12)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Snapshot: 2026-04-23 | Workspace: /Users/maxwell/Downloads/Unleashed")
    run.font.size = Pt(10.5)

    doc.add_paragraph("")
    add_paragraph(
        doc,
        "Mục đích của tài liệu này là giúp một người đang bị mất gốc Java và SQL vẫn có thể ôn lại nền tảng, hiểu cấu trúc hệ thống, hiểu bảng dữ liệu, hiểu luồng nghiệp vụ, và trả lời được các câu hỏi defend kiểu: use case này là gì, bảng này để làm gì, tại sao thiết kế như vậy mà không phải cách khác, API nào xử lý, module nào chịu trách nhiệm và dữ liệu chạy qua các lớp như thế nào.",
    )
    add_paragraph(
        doc,
        "Tài liệu này không chỉ là cheat sheet trả bài. Nó được viết như một bộ notes học bù kiến thức: bắt đầu từ khái niệm gốc, đi sang schema, rồi mới ghép vào project cụ thể. Nếu sát giờ, em có thể đọc theo thứ tự: phần 2 -> phần 5 -> phần 7 -> phần 8 -> phần 10. Nếu còn thời gian, hãy đọc toàn bộ để nói chuyện tự tin hơn.",
    )
    add_page_break(doc)


def add_manual_toc(doc):
    add_heading(doc, "Mục Lục Thủ Công", 1)
    add_numbered(doc, [
        "Cách dùng tài liệu và cách ôn nhanh khi sát giờ",
        "Use case là gì và cách trả lời câu hỏi về use case",
        "Nền tảng Java, Spring Boot, JPA cho người đang mất gốc",
        "Nền tảng SQL và cách đọc schema thương mại điện tử",
        "Toàn cảnh hệ thống Unleashed: actor, module, route, request flow",
        "Thế giới database của project: nhóm bảng và quan hệ dữ liệu",
        "Bảng lookup và seed quan trọng cần thuộc",
        "Phân tích chi tiết từng bảng trong schema",
        "Luồng nghiệp vụ lớn cho scope của An",
        "Danh sách file nên mở khi đọc code",
        "Câu hỏi defend xác suất cao và đáp án gợi ý",
        "Các điểm technical debt, mismatch, và cách nói an toàn",
        "Script nói miệng 1 phút, 3 phút, 7 phút",
        "Checklist ôn gấp trong 2 giờ và checklist ngay trước khi vào phòng",
        "Giải phẫu cột dữ liệu của các bảng lõi",
        "Bản đồ foreign key và quan hệ giữa các bảng",
        "Bản đồ endpoint và cách route kỹ thuật khớp với use case",
        "Mẫu query SQL và cách đọc statistics/dashboard query",
        "Trade-off thiết kế: tại sao lại làm thế này mà không phải thế kia",
        "Lộ trình ôn 3 giờ và lộ trình ôn qua đêm",
        "Rapid-fire Q&A bổ sung cho các câu hỏi gài sâu hơn",
    ])
    add_page_break(doc)


def add_section_use_case(doc):
    add_heading(doc, "1. Cách Dùng Tài Liệu Và Cách Ôn Nhanh", 1)
    add_paragraph(doc, "Nếu mục tiêu là chỉ cần sống sót qua buổi defend, em không đọc theo file. Em đọc theo câu chuyện nghiệp vụ: hàng được nhập vào kho -> hệ thống có tồn kho -> khách tìm sản phẩm và đặt đơn -> hệ thống reserve stock -> staff duyệt đơn -> khách hủy hoặc trả hàng -> kho được điều chỉnh lại -> dashboard lấy dữ liệu order để vẽ thống kê.")
    add_bullets(doc, [
        "Đọc để hiểu use case trước: actor nào, mục tiêu gì, input gì, output gì.",
        "Sau đó đọc luồng qua các lớp: frontend page -> service gọi API -> controller -> service -> repository -> database.",
        "Mỗi khi gặp một bảng, phải trả lời được ba câu: bảng này lưu cái gì, quan hệ với bảng nào, tại sao không nhét chung vào bảng khác.",
        "Đừng cố nhớ mọi method; hãy nhớ đúng business story và chỗ dữ liệu thay đổi.",
        "Nếu bí, luôn kéo câu trả lời về: đây là bảng master data, bảng lookup, bảng transaction history, hay bảng join many-to-many."
    ])

    add_heading(doc, "2. Use Case Là Gì Và Cách Trả Lời", 1)
    add_paragraph(doc, "Use case là mô tả một mục tiêu nghiệp vụ mà một actor muốn đạt được khi tương tác với hệ thống. Nó không chỉ là tên nút bấm hay tên API. Một use case chuẩn thường trả lời bốn ý: ai làm, làm để đạt mục đích gì, hệ thống xử lý ra sao, và kết quả cuối cùng là gì.")
    add_paragraph(doc, "Khi bị hỏi 'Use case đó là làm cái gì?', em có thể trả lời theo công thức sau:")
    add_bullets(doc, [
        "Actor: ai là người thực hiện use case này?",
        "Goal: họ muốn đạt mục tiêu gì?",
        "Input: họ nhập hoặc chọn cái gì?",
        "Process: hệ thống validate và xử lý thế nào?",
        "Output: hệ thống trả ra gì hoặc thay đổi dữ liệu gì?",
        "Tables/Modules: dữ liệu chạm vào bảng nào và code nằm ở module nào?"
    ])
    add_paragraph(doc, "Ví dụ với UC15.2 Import product: actor là staff hoặc admin; goal là nhập hàng vào một warehouse cụ thể; input gồm stock, provider, variation, quantity; process là backend tạo transaction nhập kho và cập nhật stock_variation; output là tồn kho tăng lên, history có thêm transaction IN, dashboard xem được ngay.")
    add_bullets(doc, [
        "UC05 Search product: guest/customer nhập từ khóa để hệ thống tìm sản phẩm phù hợp.",
        "UC09 Brand CRUD: admin/staff quản lý master data thương hiệu.",
        "UC13 Place order: customer chuyển cart thành order hợp lệ.",
        "UC15 View stock/import/history: staff/admin quản lý warehouse và audit biến động tồn.",
        "UC23 Statistics: staff/admin xem dữ liệu tổng hợp từ order để theo dõi vận hành."
    ])
    add_page_break(doc)


def add_java_foundation(doc):
    add_heading(doc, "3. Nền Tảng Java, Spring Boot, JPA Cho Người Đang Mất Gốc", 1)
    add_heading(doc, "3.1 Java căn bản đủ dùng để đọc project", 2)
    add_paragraph(doc, "Java là ngôn ngữ hướng đối tượng. Khi đọc project này, em chỉ cần nắm chắc các khái niệm sau là đã đọc code được khá nhiều.")
    add_bullets(doc, [
        "Class: khuôn mẫu để tạo object. Ví dụ User, Order, Brand, StockService.",
        "Object: instance cụ thể của class. Ví dụ một Order với orderId cụ thể.",
        "Field: thuộc tính của object. Ví dụ orderTotalAmount, brandName.",
        "Method: hành vi hoặc function nằm trong class. Ví dụ createOrder(), deleteBrand().",
        "Constructor: phương thức khởi tạo object. Trong project này Lombok thường sinh constructor giúp.",
        "Interface: hợp đồng hành vi. Repository thường kế thừa interface của Spring Data.",
        "Exception: lỗi dùng để chặn nghiệp vụ sai, ví dụ không đủ stock hoặc user không tồn tại."
    ])
    add_paragraph(doc, "Một số kiểu dữ liệu em sẽ gặp nhiều:")
    add_bullets(doc, [
        "String: chuỗi ký tự, dùng cho orderId, tên, email.",
        "Integer hoặc int: số nguyên, hay dùng cho id lookup table và quantity.",
        "UUID: mã định danh khó đoán, dùng cho user_id, product_id.",
        "BigDecimal: dùng cho tiền để tránh sai số số thực.",
        "OffsetDateTime: dùng cho timestamp có timezone, phù hợp với dữ liệu giao dịch.",
        "Boolean: giá trị đúng/sai như isUserEnabled, isVariationSingleBought."
    ])

    add_heading(doc, "3.2 OOP thực chiến trong project này", 2)
    add_bullets(doc, [
        "Encapsulation: dữ liệu và hành vi nằm chung trong class; Lombok @Getter/@Setter giúp truy cập field an toàn hơn.",
        "Abstraction: controller không cần biết query SQL cụ thể, nó gọi service; service không cần biết UI render ra sao.",
        "Composition/association: Order có User, PaymentMethod, ShippingMethod, Discount, nghĩa là object nối với nhau thành graph.",
        "Chúng ta ít thấy inheritance đậm ở project này; thay vào đó là annotation và composition."
    ])

    add_heading(doc, "3.3 Lombok là gì", 2)
    add_paragraph(doc, "Lombok là thư viện giảm code lặp. Em sẽ thấy @Getter, @Setter, @Builder, @NoArgsConstructor, @AllArgsConstructor. Ý nghĩa:")
    add_bullets(doc, [
        "@Getter/@Setter: sinh method get/set tự động.",
        "@Builder: cho phép tạo object theo kiểu builder, dễ đọc khi object có nhiều field.",
        "@NoArgsConstructor/@AllArgsConstructor: sinh constructor rỗng hoặc constructor đầy đủ."
    ])
    add_code_block(doc, [
        "Order order = Order.builder()",
        "    .orderDate(OffsetDateTime.now())",
        "    .orderTotalAmount(BigDecimal.valueOf(orderDTO.getTotalAmount()))",
        "    .build();"
    ])
    add_paragraph(doc, "Builder pattern giúp code khởi tạo object dài vẫn dễ đọc, nhất là với entity như Order hoặc DTO nhiều field.")

    add_heading(doc, "3.4 Spring Boot theo ngôn ngữ đời thường", 2)
    add_bullets(doc, [
        "@RestController: class nhận HTTP request và trả JSON.",
        "@Service: class chứa nghiệp vụ.",
        "@Repository: lớp truy cập database, thường thông qua JPA.",
        "@Entity: class ánh xạ tới bảng database.",
        "@Table / @Column: chỉ rõ bảng và cột nào trong DB.",
        "@Autowired hoặc constructor injection: Spring tự cấp dependency cho class.",
        "@Transactional: bọc logic trong transaction để dữ liệu nhất quán hơn."
    ])
    add_paragraph(doc, "Cách đọc một flow Spring Boot nhanh nhất:")
    add_numbered(doc, [
        "Tìm route ở `RestController`.",
        "Xem controller gọi method nào trong service.",
        "Vào service để hiểu business rule.",
        "Nếu service gọi repository, xem query hoặc entity liên quan.",
        "Đối chiếu lại với bảng trong database."
    ])

    add_heading(doc, "3.5 JPA và annotation quan hệ bảng", 2)
    add_paragraph(doc, "JPA là cách để Java object map với database relation. Dưới đây là các annotation em phải thuộc vì nó xuất hiện dày trong entity.")
    add_bullets(doc, [
        "@Id: khóa chính.",
        "@GeneratedValue: cách sinh khóa chính.",
        "@ManyToOne: nhiều bản ghi ở bảng hiện tại trỏ tới một bản ghi ở bảng kia. Ví dụ nhiều order cùng thuộc một user.",
        "@OneToMany: chiều ngược lại của many-to-one. Ví dụ một order có nhiều order detail.",
        "@ManyToMany: hai bảng nối với nhau qua bảng trung gian. Ví dụ product và category.",
        "@OneToOne: một-một. Ví dụ user và user_rank.",
        "@JoinColumn: cột foreign key cụ thể.",
        "@JoinTable: bảng trung gian cho many-to-many.",
        "@Embeddable + @EmbeddedId: dùng cho composite key.",
        "@MapsId: map foreign key vào composite key.",
        "@PrePersist / @PreUpdate: tự set thời gian khi insert/update."
    ])
    add_paragraph(doc, "Ví dụ dễ nhớ:")
    add_code_block(doc, [
        "@ManyToOne(fetch = FetchType.EAGER)",
        "@JoinColumn(name = \"user_id\")",
        "private User user;"
    ])
    add_paragraph(doc, "Đoạn trên có nghĩa là bảng hiện tại có cột `user_id` trỏ sang bảng `user`, và trong object Java nó được biểu diễn bằng field kiểu `User`.")
    add_code_block(doc, [
        "@EmbeddedId",
        "private StockVariationId id;",
        "",
        "@MapsId(\"stockId\")",
        "@ManyToOne(fetch = FetchType.LAZY)",
        "@JoinColumn(name = \"stock_id\")",
        "private Stock stock;"
    ])
    add_paragraph(doc, "Đây là pattern rất quan trọng của `stock_variation`: khóa chính thực chất là cặp `(stock_id, variation_id)`.")

    add_heading(doc, "3.6 DTO là gì", 2)
    add_paragraph(doc, "DTO là `Data Transfer Object`. Nó dùng để gửi dữ liệu qua API hoặc gom dữ liệu cho UI. Lý do không trả entity thẳng:")
    add_bullets(doc, [
        "Không phải field nào trong entity cũng nên expose cho frontend.",
        "UI có khi cần dữ liệu tổng hợp từ nhiều bảng.",
        "DTO giúp response gọn và đúng mục đích hơn entity."
    ])

    add_heading(doc, "3.7 Transaction và vì sao nó quan trọng", 2)
    add_paragraph(doc, "Transaction là nguyên tắc 'hoặc làm hết, hoặc rollback hết'. Với order và warehouse, đây là thứ cực quan trọng.")
    add_bullets(doc, [
        "Nếu import hàng mà transaction log tạo được nhưng stock không tăng thì dữ liệu sai.",
        "Nếu order tạo xong nhưng reserve stock fail thì dữ liệu cũng sai.",
        "@Transactional giúp gói cả chuỗi thao tác lại thành một đơn vị công việc."
    ])

    add_heading(doc, "3.8 Exception và business rule", 2)
    add_paragraph(doc, "Trong project này, business rule thường được enforce bằng exception. Ví dụ:")
    add_bullets(doc, [
        "Không đủ stock -> throw lỗi.",
        "Brand trùng tên hoặc trùng website -> throw lỗi.",
        "Hủy đơn sai trạng thái -> throw lỗi.",
        "Không tìm thấy provider hoặc variation -> throw lỗi."
    ])
    add_paragraph(doc, "Khi defend, em có thể nói: service layer là nơi kiểm tra business rule và ném exception nếu rule bị vi phạm.")
    add_page_break(doc)


def add_sql_foundation(doc):
    add_heading(doc, "4. Nền Tảng SQL Và Cách Đọc Schema", 1)
    add_paragraph(doc, "Mất gốc SQL vẫn cứu được nếu em chỉ nắm đúng các pattern. Project này chủ yếu xoay quanh table, primary key, foreign key, join table, aggregate query và lookup table.")

    add_heading(doc, "4.1 Các khái niệm SQL bắt buộc", 2)
    add_bullets(doc, [
        "Table: bảng dữ liệu.",
        "Row: một bản ghi.",
        "Column: một thuộc tính.",
        "Primary Key: khóa chính, định danh duy nhất mỗi row.",
        "Foreign Key: khóa ngoại, liên kết giữa hai bảng.",
        "Composite Key: khóa chính ghép từ nhiều cột.",
        "Lookup Table: bảng danh mục như status, type, role.",
        "Join Table: bảng nối cho quan hệ many-to-many."
    ])

    add_heading(doc, "4.2 One-to-One, One-to-Many, Many-to-Many", 2)
    add_bullets(doc, [
        "One-to-One: user <-> user_rank. Một user có đúng một trạng thái rank hiện tại.",
        "One-to-Many: brand -> product. Một brand có nhiều product.",
        "Many-to-Many: product <-> category qua product_category; sale <-> product qua sale_product."
    ])
    add_paragraph(doc, "Nếu bị hỏi 'tại sao phải có bảng nối', hãy trả lời: vì quan hệ nhiều-nhiều không thể biểu diễn sạch bằng một foreign key đơn lẻ trong một bảng.")

    add_heading(doc, "4.3 Current State và History là hai thứ khác nhau", 2)
    add_paragraph(doc, "Đây là ý rất hay bị hỏi ở đồ án quản lý kho.")
    add_bullets(doc, [
        "`stock_variation` là current state: hiện tại còn bao nhiêu.",
        "`transaction` là history: tại sao hiện tại lại còn đúng số đó.",
        "Một hệ thống kho muốn audit được thì phải có cả hai."
    ])

    add_heading(doc, "4.4 Join căn bản cần thuộc", 2)
    add_paragraph(doc, "Inner Join dùng khi chỉ cần các bản ghi có liên kết ở cả hai bảng. Left Join dùng khi muốn giữ tất cả bản ghi ở bảng trái kể cả khi bảng phải không có dữ liệu.")
    add_code_block(doc, [
        "SELECT o.order_id, os.order_status_name",
        "FROM dbo.[order] o",
        "JOIN dbo.order_status os ON o.order_status_id = os.order_status_id;"
    ])
    add_paragraph(doc, "Query trên là join order với order_status để đổi status id thành tên status có nghĩa với người dùng.")
    add_code_block(doc, [
        "SELECT s.stock_id, s.stock_name, sv.stock_quantity",
        "FROM dbo.stock s",
        "LEFT JOIN dbo.stock_variation sv ON s.stock_id = sv.stock_id;"
    ])
    add_paragraph(doc, "Left join ở đây cho phép một stock vẫn xuất hiện ngay cả khi chưa có variation nào trong kho đó.")

    add_heading(doc, "4.5 Aggregate query: SUM, COUNT, GROUP BY", 2)
    add_paragraph(doc, "Statistics của project này chủ yếu dựa trên aggregate.")
    add_code_block(doc, [
        "SELECT CAST(order_date AS DATE) AS order_day, SUM(order_total_amount)",
        "FROM dbo.[order]",
        "WHERE MONTH(order_date) = @month AND YEAR(order_date) = @year",
        "GROUP BY CAST(order_date AS DATE);"
    ])
    add_paragraph(doc, "Đây là kiểu query doanh thu theo ngày trong tháng. `GROUP BY` gom nhiều order cùng ngày lại, `SUM` cộng tiền.")
    add_code_block(doc, [
        "SELECT os.order_status_name, COUNT(*)",
        "FROM dbo.[order] o",
        "JOIN dbo.order_status os ON o.order_status_id = os.order_status_id",
        "GROUP BY os.order_status_name;"
    ])
    add_paragraph(doc, "Đây là kiểu query thống kê số đơn theo trạng thái.")

    add_heading(doc, "4.6 Normalization nói đơn giản", 2)
    add_bullets(doc, [
        "Đừng lặp dữ liệu nếu dữ liệu đó dùng chung ở nhiều nơi.",
        "Tách bảng lookup cho những giá trị danh mục dùng đi dùng lại.",
        "Tách bảng join cho quan hệ nhiều-nhiều.",
        "Tách current state khỏi history nếu nghiệp vụ cần audit."
    ])
    add_paragraph(doc, "Project này không hoàn hảo 100%, nhưng về tư duy schema thì khá nhiều chỗ đi theo hướng chuẩn hóa thương mại điện tử cơ bản.")

    add_heading(doc, "4.7 Cách đọc một bảng khi bị giảng viên chỉ bất ngờ", 2)
    add_numbered(doc, [
        "Nhìn tên bảng và đoán domain: user, catalog, warehouse, order, pricing hay engagement.",
        "Tìm primary key.",
        "Tìm foreign key hoặc các cột kiểu `*_id`.",
        "Xác định bảng này là master, lookup, join hay transaction.",
        "Tự hỏi dữ liệu này là current state hay history.",
        "Tự hỏi nếu bỏ bảng này đi thì hệ thống sẽ mất khả năng gì."
    ])
    add_page_break(doc)


def add_system_overview(doc):
    add_heading(doc, "5. Toàn Cảnh Hệ Thống Unleashed", 1)
    add_paragraph(doc, "Unleashed là website bán quần áo với frontend React và backend Spring Boot, lưu dữ liệu trên SQL Server. Hệ thống có cả phần customer-facing và dashboard nội bộ.")

    add_heading(doc, "5.1 Tech stack và vai trò của từng lớp", 2)
    add_bullets(doc, [
        "Frontend: React, route theo role, gọi API bằng apiClient.",
        "Backend: Spring Boot, JWT auth, REST API, JPA entity/repository.",
        "Database: SQL Server với schema thương mại điện tử gồm user, product, variation, stock, order, discount, sale, review, notification."
    ])

    add_heading(doc, "5.2 Actor", 2)
    add_bullets(doc, [
        "Guest: xem shop, search, xem thông tin công khai.",
        "Customer: mua hàng, checkout, xem order, profile, wishlist, review.",
        "Staff: dùng dashboard để vận hành đơn, kho, sale, thông báo.",
        "Admin: có quyền gần như đầy đủ và quản lý tài khoản/thiết lập nhiều hơn staff."
    ])

    add_heading(doc, "5.3 Cách route ở frontend phản ánh actor", 2)
    add_paragraph(doc, "Trong `AppRoutes.js`, các route shop như `/shop`, `/search`, `/shop/product/:id` phục vụ khách và customer. Các route `/user/*` phục vụ customer đã đăng nhập. Các route `/Dashboard/*` được bọc bởi `PrivateRoute` cho `ADMIN` hoặc `STAFF`.")

    add_heading(doc, "5.4 Cách package ở backend phản ánh module", 2)
    add_bullets(doc, [
        "rest: điểm vào HTTP cho từng module như order, stock, brand, statistics.",
        "service: nghiệp vụ chính của từng module.",
        "repo: truy cập database, query JPA/native query.",
        "entity: mô hình bảng dữ liệu.",
        "dto: object trao đổi dữ liệu với frontend.",
        "security/util: JWT, filter, helper."
    ])

    add_heading(doc, "5.5 Request flow chuẩn", 2)
    add_numbered(doc, [
        "User thao tác trên UI.",
        "Frontend page hoặc service gọi API.",
        "Controller nhận request và parse input.",
        "Service xử lý nghiệp vụ, validate business rule, gọi repository nếu cần.",
        "Repository query database.",
        "Backend trả DTO/JSON.",
        "Frontend render kết quả."
    ])
    add_paragraph(doc, "Nếu em luôn nhìn mọi chức năng theo flow này thì rất khó bị lạc, kể cả khi mất gốc Java.")
    add_page_break(doc)


def add_lookup_tables(doc):
    add_heading(doc, "6. Bảng Lookup Và Seed Quan Trọng Cần Thuộc", 1)
    add_paragraph(doc, "Lookup table là các bảng danh mục. Đây là loại bảng em nên học thuộc trước vì giảng viên rất hay hỏi status, type, method, role đang có những gì.")

    add_heading(doc, "6.1 Role", 2)
    add_simple_table(doc, ["ID", "Role", "Ý nghĩa"], lookup_rows["role"], [0.6, 1.2, 4.6])

    add_heading(doc, "6.2 Payment Method", 2)
    add_simple_table(doc, ["ID", "Method", "Ý nghĩa"], lookup_rows["payment_method"], [0.6, 1.2, 4.6])

    add_heading(doc, "6.3 Shipping Method", 2)
    add_simple_table(doc, ["ID", "Method", "Ý nghĩa"], lookup_rows["shipping_method"], [0.6, 1.2, 4.6])

    add_heading(doc, "6.4 Transaction Type", 2)
    add_simple_table(doc, ["ID", "Type", "Ý nghĩa"], lookup_rows["transaction_type"], [0.6, 1.2, 4.6])

    add_heading(doc, "6.5 Product Status", 2)
    add_simple_table(doc, ["ID", "Status", "Ý nghĩa"], lookup_rows["product_status"], [0.6, 1.7, 4.1])

    add_heading(doc, "6.6 Discount Type và Discount Status", 2)
    add_simple_table(doc, ["ID", "Discount Type", "Ý nghĩa"], lookup_rows["discount_type"], [0.6, 1.7, 4.1])
    doc.add_paragraph("")
    add_simple_table(doc, ["ID", "Discount Status", "Ý nghĩa"], lookup_rows["discount_status"], [0.6, 1.7, 4.1])

    add_heading(doc, "6.7 Sale Type và Sale Status", 2)
    add_simple_table(doc, ["ID", "Sale Type", "Ý nghĩa"], lookup_rows["sale_type"], [0.6, 1.7, 4.1])
    doc.add_paragraph("")
    add_simple_table(doc, ["ID", "Sale Status", "Ý nghĩa"], lookup_rows["sale_status"], [0.6, 1.7, 4.1])

    add_heading(doc, "6.8 Order Status", 2)
    add_simple_table(doc, ["ID", "Order Status", "Ý nghĩa"], lookup_rows["order_status"], [0.6, 1.7, 4.1])

    add_heading(doc, "6.9 Rank", 2)
    add_simple_table(doc, ["ID", "Rank", "Payment Requirement", "Base Discount", "Ghi chú"], lookup_rows["rank"], [0.5, 1.0, 1.8, 1.0, 2.7])

    add_paragraph(doc, "Mẹo học nhanh: role, payment method, shipping method và order status là bốn bảng lookup xác suất cao nhất bị hỏi miệng.")
    add_page_break(doc)


def add_table_deep_dive(doc):
    add_heading(doc, "7. Phân Tích Chi Tiết Từng Bảng", 1)
    add_paragraph(doc, "Phần này là lõi của tài liệu. Mỗi bảng đều được giải thích theo cùng một pattern để em luyện phản xạ: bảng đó dùng để làm gì, khóa nào là chính, quan hệ với bảng nào, tại sao phải tách riêng và câu defend nên nói gì.")

    matrix_rows = []
    for entry in table_catalog:
        matrix_rows.append((entry["name"], entry["domain"], entry["pk"], entry["purpose"]))
    add_heading(doc, "7.1 Ma trận nhìn nhanh toàn bộ schema", 2)
    add_simple_table(doc, ["Bảng", "Domain", "Khóa chính", "Mục đích"], matrix_rows, [1.3, 1.3, 1.6, 3.3])

    domain_order = [
        "User/Auth",
        "Catalog",
        "Catalog/Order",
        "Warehouse",
        "Pricing",
        "Order",
        "Customer Engagement",
    ]
    current_domain = None
    for entry in table_catalog:
        if entry["domain"] != current_domain:
            current_domain = entry["domain"]
            add_heading(doc, f"7.{domain_order.index(current_domain)+2} Domain {current_domain}", 2)
        add_heading(doc, f"Bảng `{entry['name']}`", 3)
        add_paragraph(doc, f"Dùng để làm gì: {entry['purpose']}")
        add_paragraph(doc, f"Khóa chính: {entry['pk']}")
        add_paragraph(doc, f"Quan hệ chính: {entry['relations']}")
        add_paragraph(doc, f"Tại sao thiết kế như vậy: {entry['why']}")
        add_bullets(doc, entry["defend"], level=1)

    add_heading(doc, "7.8 Những mẫu thiết kế database đáng học từ project", 2)
    add_bullets(doc, [
        "Header-detail pattern: `order` và `order_variation_single`.",
        "Current state + history pattern: `stock_variation` và `transaction`.",
        "Lookup pattern: `role`, `payment_method`, `shipping_method`, `order_status`, `transaction_type`, `product_status`.",
        "Many-to-many join table pattern: `product_category`, `sale_product`, `user_discount`, `wishlist` ở mức mô hình.",
        "One-to-one state extension pattern: `user` và `user_rank`."
    ])
    add_page_break(doc)


def add_flow_section(doc):
    add_heading(doc, "8. Luồng Nghiệp Vụ Lớn Cho Scope Của An", 1)
    add_paragraph(doc, "Nếu chỉ được học một thứ để defend, hãy học luồng. Luồng giúp em nói chuyện có mạch: dữ liệu đi từ đâu, qua lớp nào, đụng bảng nào, đổi trạng thái ra sao.")

    for index, flow in enumerate(core_flows, start=1):
        add_heading(doc, f"8.{index} {flow['title']}", 2)
        add_paragraph(doc, f"Actor: {flow['actor']}")
        add_paragraph(doc, f"Mục tiêu: {flow['goal']}")
        add_paragraph(doc, "Frontend liên quan:")
        add_bullets(doc, flow["frontend"], level=1)
        add_paragraph(doc, "Backend liên quan:")
        add_bullets(doc, flow["backend"], level=1)
        add_paragraph(doc, f"Bảng chính chạm vào: {', '.join(flow['tables'])}")
        add_paragraph(doc, "Ý defend nên nói:")
        add_bullets(doc, flow["defend"], level=1)

    add_heading(doc, "8.13 Chuỗi nghiệp vụ tổng hợp dễ nhớ nhất", 2)
    add_numbered(doc, [
        "Provider giao hàng vào warehouse.",
        "Staff import hàng -> tạo transaction IN -> tăng stock_variation.",
        "Customer search/shop nhìn thấy sản phẩm còn hàng.",
        "Customer thêm variation vào cart.",
        "Customer checkout -> backend check stock -> tạo order header/detail.",
        "Hệ thống reserve stock -> transaction OUT -> stock giảm.",
        "Staff duyệt đơn -> đổi order_status theo vòng đời.",
        "Nếu khách nhận hàng -> completed; nếu hủy/return -> đổi trạng thái và trả stock về bằng transaction IN.",
        "Dashboard thống kê đọc dữ liệu từ order và order detail để vẽ chart."
    ])
    add_page_break(doc)


def add_file_map_section(doc):
    add_heading(doc, "9. Danh Sách File Nên Mở Khi Đọc Code", 1)
    add_paragraph(doc, "Bảng này giúp em mở file có mục đích. Đừng mở lung tung. Hãy luôn đi từ UI -> controller -> service -> repository.")
    add_simple_table(doc, ["Nhóm", "File", "Lý do đọc"], file_map_rows, [1.4, 3.4, 2.0])
    add_paragraph(doc, "Thứ tự đọc khuyên dùng nếu chỉ có một buổi: warehouse -> stock history -> checkout -> order service -> statistics -> brand/search/profile.")
    add_page_break(doc)


def add_qa_section(doc):
    qa_items = [
        ("Use case là gì?", "Use case là mục tiêu nghiệp vụ mà một actor muốn đạt được khi tương tác với hệ thống; em thường trả lời theo actor, goal, input, process, output."),
        ("UC15.2 Import product là làm gì?", "Staff hoặc admin nhập hàng vào một warehouse. Backend tạo transaction nhập kho và tăng tồn trong stock_variation."),
        ("Bảng stock để làm gì?", "Lưu thông tin warehouse như tên kho và địa chỉ. Nó là master data của kho."),
        ("Bảng stock_variation để làm gì?", "Lưu số lượng tồn của từng variation trong từng warehouse. Đây là current stock state."),
        ("Tại sao không lưu quantity trực tiếp trong variation?", "Vì một variation có thể nằm ở nhiều warehouse khác nhau nên tồn phải tách theo warehouse."),
        ("Bảng transaction để làm gì?", "Lưu lịch sử nhập/xuất/điều chỉnh kho để audit và truy vết."),
        ("Tại sao phải có transaction nếu đã có stock_variation?", "Vì stock_variation chỉ cho biết đang còn bao nhiêu, còn transaction cho biết tại sao lại còn đúng số đó."),
        ("Brand dùng để làm gì?", "Brand là master data của thương hiệu; nhiều product có thể dùng chung một brand."),
        ("Tại sao brand tách khỏi product?", "Để tránh lặp tên thương hiệu trên nhiều product và dễ CRUD."),
        ("Category dùng để làm gì?", "Phân loại product trong catalog và filter trên shop/dashboard."),
        ("Tại sao cần product_category?", "Vì một product có thể thuộc nhiều category nên phải có join table many-to-many."),
        ("Variation là gì?", "Variation là biến thể của product theo size, color, image, price; đây là mức gần với SKU."),
        ("Variation_single là gì?", "Đó là từng đơn vị item cụ thể của một variation, dùng để gắn vào order detail ở mức item."),
        ("Tại sao có variation rồi còn variation_single?", "Vì codebase hiện mô hình hóa item đã bán ở mức từng đơn vị để trace rõ hơn thay vì chỉ quantity tổng."),
        ("Order table dùng để làm gì?", "Đây là order header, lưu thông tin tổng của đơn như user, status, payment, shipping, total, tracking."),
        ("Order detail nằm ở đâu?", "Nằm ở order_variation_single, là bảng detail của order ở mức item unit."),
        ("Tại sao order phải tách header và detail?", "Vì một order có nhiều sản phẩm; tách header-detail là pattern chuẩn cho hóa đơn/đơn hàng."),
        ("variation_price_at_purchase dùng để làm gì?", "Snapshot giá lúc mua để lịch sử order không bị sai khi giá hiện tại thay đổi."),
        ("Payment_method dùng để làm gì?", "Lookup table cho COD, VNPay, Transfer; mỗi method kéo theo flow thanh toán khác nhau."),
        ("Shipping_method dùng để làm gì?", "Lookup table cho phương thức giao hàng; ảnh hưởng expected delivery và logic hiển thị."),
        ("Order_status dùng để làm gì?", "Mô hình hóa vòng đời đơn hàng như pending, processing, shipping, completed, cancelled, returned."),
        ("Tại sao order_status không dùng boolean?", "Vì đơn hàng có nhiều trạng thái nghiệp vụ chứ không chỉ hoàn thành hay chưa."),
        ("Cart để làm gì?", "Lưu variation và quantity mà user định mua trước khi checkout."),
        ("Tại sao cart dùng composite key?", "Để một user không có hai dòng trùng cùng một variation."),
        ("Wishlist để làm gì?", "Lưu danh sách sản phẩm yêu thích, đơn giản hơn cart vì không có quantity."),
        ("Review có order_id để làm gì?", "Để gắn review với đơn đã mua, phục vụ verified purchase và history."),
        ("Comment_parent để làm gì?", "Mô hình hóa quan hệ cha-con giữa comment, hỗ trợ reply/thread."),
        ("Notification_user để làm gì?", "Track notification nào gửi cho user nào và user đó đã xem hoặc xóa chưa."),
        ("User_rank để làm gì?", "Lưu trạng thái rank hiện tại của user, money spent, ngày hết hạn."),
        ("Tại sao rank tách khỏi user?", "Vì rank có nhiều thuộc tính và lifecycle riêng, không phải chỉ là một cột text trong user."),
        ("Discount khác sale ở đâu?", "Discount thường là voucher/code và có thể gắn user hoặc checkout; sale là chương trình giá áp lên product."),
        ("Tại sao có user_discount?", "Để quản lý quan hệ user-discount và track discount đã dùng chưa."),
        ("Tại sao statistics tính ở backend?", "Vì aggregate query nên đặt ở backend để đúng dữ liệu, tối ưu hơn, và frontend chỉ render chart."),
        ("Doanh thu lấy từ đâu?", "Từ bảng order, group và sum theo ngày/tháng/năm."),
        ("Best-selling lấy từ đâu?", "Từ order detail/order_variation_single kết hợp order theo khoảng thời gian và trạng thái."),
        ("Search product xử lý ở đâu?", "Ở backend để hỗ trợ query, filter, pagination và sort."),
        ("Tại sao cần service layer?", "Để tách business logic khỏi controller, giúp code gọn, dễ test, dễ tái sử dụng."),
        ("Controller có nhiệm vụ gì?", "Nhận request, parse input, gọi service, trả response."),
        ("Repository có nhiệm vụ gì?", "Truy cập database và trả dữ liệu cho service."),
        ("Entity có nhiệm vụ gì?", "Ánh xạ object Java với bảng database."),
        ("DTO có nhiệm vụ gì?", "Mang dữ liệu qua API hoặc phục vụ UI mà không expose entity thẳng toàn bộ."),
        ("@Transactional dùng để làm gì?", "Đảm bảo chuỗi thao tác dữ liệu thành một transaction nhất quán."),
        ("Nếu bị hỏi vì sao dùng UUID cho user/product?", "Vì đó là thực thể lớn, public-facing và cần định danh ổn định khó đoán hơn."),
        ("Nếu bị hỏi sao không merge stock và transaction?", "Vì một bảng là current state, một bảng là history; merge sẽ làm cả hai mục tiêu đều xấu đi."),
        ("Nếu bị hỏi mô hình hệ thống theo 1 câu?", "Đây là hệ thống e-commerce có phân lớp rõ giữa catalog, warehouse, order và dashboard analytics."),
        ("Nếu bị hỏi scope của em là gì?", "Em tập trung nhiều nhất vào stock, warehouse, import history, statistics và các flow order liên quan, ngoài ra có quét brand, search, homepage và profile."),
        ("Nếu bị hỏi điểm mạnh của schema?", "Khá rõ giữa master data, lookup data, transaction data và join tables; phù hợp cho e-commerce đồ án nhỏ."),
        ("Nếu bị hỏi điểm yếu của schema?", "Một số join table và mapping còn mang dấu vết reverse-engineering, và vài logic nghiệp vụ có thể siết thêm nếu triển khai production."),
    ]
    add_heading(doc, "10. Câu Hỏi Defend Xác Suất Cao Và Đáp Án Gợi Ý", 1)
    add_paragraph(doc, "Phần này được viết để em học thuộc hoặc dùng làm flashcard.")
    for idx, (q, a) in enumerate(qa_items, start=1):
        add_heading(doc, f"10.{idx} {q}", 2)
        add_paragraph(doc, a)
    add_page_break(doc)


def add_safe_talk_section(doc):
    add_heading(doc, "11. Technical Debt, Mismatch, Và Cách Nói An Toàn", 1)
    add_paragraph(doc, "Không nên overclaim. Một số phần của codebase có dấu hiệu đồ án gấp hoặc reverse-engineer. Thay vì nói quá đà, em nên dùng các câu an toàn sau.")
    add_bullets(doc, [
        "Ở mức đồ án nhỏ, nhóm em ưu tiên hoàn thiện flow end-to-end trước, sau đó mới siết thêm các rule production.",
        "Thiết kế hiện tại đã tách được các domain chính và hỗ trợ nghiệp vụ demo khá rõ, nhưng vẫn còn chỗ có thể harden thêm.",
        "Một số join table và entity mapping tối giản do codebase được dựng nhanh, tuy nhiên ý nghĩa nghiệp vụ của dữ liệu vẫn khá rõ.",
        "Em hiểu được business story và quan hệ dữ liệu; nếu cần đi sâu hơn về một đoạn code cụ thể em có thể mở file và trace ngay."
    ])
    add_paragraph(doc, "Các mismatch hoặc điểm cần cẩn trọng khi nói:")
    add_bullets(doc, [
        "Code và schema không phải chỗ nào cũng đồng bộ hoàn hảo. Ví dụ `transaction_note` có trong DB nhưng entity hiện đánh `@Transient`.",
        "Một số bảng join trong code rất tối giản, phản ánh xu hướng reverse-engineering hơn là domain model viết tay từ đầu.",
        "Authorization ở codebase có ý tưởng rõ, nhưng nếu nói tới production thì nên luôn thêm câu 'có thể harden thêm'.",
        "Warehouse allocation theo order hiện không được trace tinh như một WMS thật; nếu bị hỏi sâu, cứ nói đây là mức đồ án nhỏ và còn hướng cải tiến."
    ])
    add_heading(doc, "11.1 Câu đỡ đòn khi bí", 2)
    add_bullets(doc, [
        "Bảng này là bảng master data dùng chung cho nhiều thực thể khác, nên nhóm em tách riêng để tránh lặp dữ liệu.",
        "Bảng này là transaction/history table nên chức năng chính là lưu vết thay đổi chứ không phải chỉ lưu trạng thái hiện tại.",
        "Bảng này là join table để biểu diễn quan hệ nhiều-nhiều.",
        "Use case này được nhóm em thiết kế theo flow controller -> service -> repository, trong đó business rule chính nằm ở service.",
        "Nếu mở rộng production, nhóm em sẽ siết thêm validation, authorization và audit ở bước này."
    ])
    add_page_break(doc)


def add_speaking_scripts(doc):
    add_heading(doc, "12. Script Nói Miệng 1 Phút, 3 Phút, 7 Phút", 1)

    add_heading(doc, "12.1 Script 1 phút", 2)
    add_paragraph(doc, "Em phụ trách chủ yếu các chức năng liên quan đến warehouse, stock, import history, statistics và một phần flow order. Hệ thống của nhóm em dùng React ở frontend, Spring Boot ở backend và SQL Server để lưu dữ liệu. Về mặt dữ liệu, nhóm em tách khá rõ giữa master data như brand, product, stock; lookup data như role, payment method, order status; và transaction data như order detail hay stock transaction. Với warehouse, tồn kho thực tế được lưu ở bảng stock_variation theo từng variation và từng warehouse, còn history nhập xuất được lưu ở transaction. Với order, backend sẽ kiểm tra stock, tạo order, lưu detail và reserve hàng trước khi staff tiếp tục xử lý. Dashboard statistics thì đọc dữ liệu aggregate từ order để hiển thị doanh thu, trạng thái đơn và sản phẩm bán chạy.")

    add_heading(doc, "12.2 Script 3 phút", 2)
    add_paragraph(doc, "Phần em nắm chính là cụm stock và order. Tư duy của em là nhìn hệ thống thành một chuỗi nghiệp vụ liên tục. Đầu tiên hàng được nhập từ provider vào warehouse thông qua use case import product. Khi import, backend tạo transaction loại IN để lưu lịch sử nhập kho, đồng thời cập nhật stock_variation để tăng tồn hiện tại của variation trong warehouse đó. Nhờ vậy hệ thống vừa biết đang còn bao nhiêu, vừa biết vì sao lại còn số đó. Sau khi có tồn kho, customer có thể search sản phẩm, xem danh sách sản phẩm ở homepage hoặc shop, thêm variation vào cart rồi đi checkout. Ở bước checkout, backend kiểm tra stock, tạo order header, lưu order detail và reserve stock bằng cách giảm stock_variation và tạo transaction OUT. Sau đó flow sẽ tách ra theo payment method như COD, VNPay hoặc transfer. Với staff hoặc admin, dashboard order cho phép review và chuyển trạng thái đơn theo vòng đời như pending, processing, shipping, completed. Nếu đơn bị hủy hoặc trả hàng, hệ thống sẽ hoàn stock và cập nhật lại trạng thái. Cuối cùng, dashboard statistics lấy dữ liệu từ order và order detail để hiển thị doanh thu, order status và best-selling products. Ngoài ra em cũng có đọc và hỗ trợ các phần brand CRUD, search, homepage list và profile để hiểu flow xuyên suốt của hệ thống.")

    add_heading(doc, "12.3 Script 7 phút", 2)
    add_paragraph(doc, "Nếu nhìn toàn hệ thống theo hướng defend, em chia nó thành 6 domain. Thứ nhất là domain user và auth với các bảng như user, role, rank, user_rank để quản lý tài khoản, phân quyền và membership. Thứ hai là domain catalog gồm brand, category, product, variation, size, color và product_category. Ở đây product là thực thể chung, còn variation là biến thể theo size và màu, vì giá và tồn kho cần quản lý ở mức đó. Thứ ba là domain warehouse gồm stock, stock_variation, provider, transaction_type và transaction. Em thấy điểm hợp lý nhất ở đây là nhóm em tách current stock với history. stock_variation chỉ lưu số lượng hiện tại theo variation trong từng warehouse, còn transaction lưu lịch sử movement như nhập, xuất hoặc điều chỉnh. Thứ tư là domain pricing gồm discount, sale và các bảng type/status tương ứng, cộng với user_discount và sale_product để model quan hệ nhiều nhiều. Thứ năm là domain order gồm payment_method, shipping_method, order_status, order và order_variation_single. Ở đây order là phần header, còn order_variation_single là detail, giúp snapshot item và giá tại thời điểm mua. Thứ sáu là customer engagement gồm cart, wishlist, review, comment, notification. Khi đi vào flow của phần em phụ trách, logic bắt đầu từ import kho. Staff chọn warehouse, provider, variation và số lượng; backend tạo transaction IN và tăng stock_variation. Sau đó customer có thể search sản phẩm, duyệt product list và checkout. Ở bước checkout, service order kiểm tra stock, tạo order, lưu detail, reserve stock và xử lý payment method. Staff tiếp tục review order trên dashboard, đơn sẽ đi qua các trạng thái pending, processing, shipping và completed; hoặc rẽ sang cancelled, returning, inspection, returned tùy nghiệp vụ. Cuối cùng statistics đọc lại dữ liệu order để vẽ biểu đồ doanh thu, trạng thái đơn và best-selling. Em thấy hệ thống của nhóm em khá rõ ở cách tách lookup, join table, header-detail và current-state-vs-history, nên dù đây là đồ án nhỏ nhưng đủ để trình bày được reasoning về thiết kế dữ liệu.")
    add_page_break(doc)


def add_cram_plan(doc):
    add_heading(doc, "13. Checklist Ôn Gấp Trong 2 Giờ Và Checklist Ngay Trước Khi Vào Phòng", 1)
    add_heading(doc, "13.1 Nếu còn đúng 2 giờ", 2)
    add_numbered(doc, [
        "Đọc phần Use case và công thức trả lời câu hỏi về use case.",
        "Đọc phần Java/Spring và SQL nền tảng, nhất là ManyToOne, ManyToMany, composite key, JOIN, GROUP BY.",
        "Đọc lookup tables và học thuộc role, payment_method, order_status, transaction_type.",
        "Đọc phần deep dive của các bảng: user, product, variation, stock, stock_variation, transaction, order, order_variation_single, discount, sale, cart.",
        "Đọc flow import kho -> stock -> checkout -> reserve -> cancel/return -> statistics.",
        "Đọc phần Q&A và script 3 phút.",
        "Mở 5 file chính trên máy để nếu bị hỏi sâu còn biết chỗ chỉ vào."
    ])
    add_heading(doc, "13.2 Nếu còn 30 phút", 2)
    add_bullets(doc, [
        "Học thuộc chuỗi: import hàng -> stock tăng -> customer mua -> stock giảm -> staff xử lý -> statistics đọc order.",
        "Học thuộc: stock khác stock_variation khác transaction.",
        "Học thuộc: product khác variation khác variation_single.",
        "Học thuộc: order khác order_variation_single.",
        "Học thuộc 9 trạng thái order.",
        "Học thuộc câu trả lời 'tại sao dùng bảng nối'.",
        "Học thuộc script 1 phút và 3 phút."
    ])
    add_heading(doc, "13.3 Ngay trước khi vào phòng", 2)
    add_bullets(doc, [
        "Nhớ thở chậm và luôn trả lời từ business trước rồi mới tới code.",
        "Nếu bị hỏi bảng nào để làm gì, nói theo pattern: mục đích -> quan hệ -> lý do tách bảng.",
        "Nếu bị hỏi use case, nói theo pattern actor -> goal -> input -> process -> output.",
        "Nếu bị hỏi code, nói theo pattern frontend -> controller -> service -> repository -> table.",
        "Nếu bí, dùng một câu an toàn và xin phép mở code để xác minh method name cụ thể."
    ])

    add_heading(doc, "13.4 Chốt hạ", 2)
    add_paragraph(doc, "Điều quan trọng nhất không phải là nhớ 100% tên method. Điều quan trọng là em hiểu được chuyện gì đang xảy ra trong hệ thống. Nếu em kể được câu chuyện dữ liệu hợp lý, chỉ ra được bảng nào giữ current state, bảng nào giữ history, bảng nào là join table, và nói được actor nào đi qua route nào thì em đã ở trạng thái defend khá an toàn rồi.")


def add_column_level_section(doc):
    add_page_break(doc)
    add_heading(doc, "14. Giải Phẫu Cột Dữ Liệu Của Các Bảng Lõi", 1)
    add_paragraph(doc, "Phần này dành cho kiểu câu hỏi rất cụ thể như: cột này để làm gì, tại sao cần nó, nếu bỏ đi thì ảnh hưởng gì. Em không cần thuộc 100% toàn bộ schema, nhưng nên thuộc thật chắc các bảng lõi trong scope của mình.")
    add_paragraph(doc, "Cách dùng phần này: mỗi bảng em đọc theo ba ý. Thứ nhất là purpose để nhớ bảng đó sinh ra để phục vụ domain nào. Thứ hai là từng cột dùng để làm gì. Thứ ba là ý nghĩa defend, tức tại sao dự án lại giữ cột đó thay vì bỏ hoặc gộp vào nơi khác.")

    for idx, (table_name, payload) in enumerate(core_table_column_details.items(), start=1):
        add_heading(doc, f"14.{idx} Bảng `{table_name}`", 2)
        add_paragraph(doc, payload["purpose"])
        add_simple_table(
            doc,
            ["Cột", "Ý nghĩa", "Tại sao quan trọng"],
            payload["rows"],
            [1.7, 2.1, 3.1],
        )
        add_paragraph(doc, "Cách nói ngắn nếu bị hỏi miệng:")
        summary_bits = []
        for column_name, meaning, importance in payload["rows"][:4]:
            summary_bits.append(f"`{column_name}`: {meaning.lower()}.")
        add_bullets(doc, summary_bits, level=1)


def add_fk_map_section(doc):
    add_page_break(doc)
    add_heading(doc, "15. Bản Đồ Foreign Key Và Quan Hệ Giữa Các Bảng", 1)
    add_paragraph(doc, "Nếu bị hỏi kiểu 'bảng này liên kết với bảng nào' hoặc 'tại sao lại có khóa ngoại này', phần này là cứu tinh. Nó gom quan hệ theo đúng ngôn ngữ defend: cột nguồn, bảng đích, kiểu quan hệ và ý nghĩa nghiệp vụ.")
    add_paragraph(doc, "Một mẹo cực quan trọng: đừng chỉ đọc FK như kỹ thuật. Hãy luôn dịch nó sang business sentence. Ví dụ `order.user_id -> user.user_id` có nghĩa là mỗi đơn phải thuộc về một người dùng cụ thể.")
    add_simple_table(
        doc,
        ["Nguồn", "Đích", "Kiểu quan hệ", "Ý nghĩa nghiệp vụ"],
        foreign_key_rows,
        [1.8, 1.8, 1.3, 2.4],
    )
    add_heading(doc, "15.1 Cách nhóm quan hệ để dễ nhớ", 2)
    add_bullets(doc, [
        "Nhóm `user/auth`: user nối role, user_rank nối user và rank.",
        "Nhóm `catalog`: product nối brand và product_status; variation nối product, size, color; product_category nối product với category.",
        "Nhóm `warehouse`: stock_variation nối stock với variation; transaction nối stock, variation, provider, employee và transaction_type.",
        "Nhóm `pricing`: discount nối status/type/rank; user_discount và sale_product là join table.",
        "Nhóm `order`: order nối user, status, payment, shipping, discount, employee; order_variation_single nối order với variation_single.",
        "Nhóm `engagement`: cart, wishlist, review, comment, notification_user đều bám vào user/product/order/comment/notification."
    ])
    add_heading(doc, "15.2 Câu trả lời mẫu khi bị chỉ vào một đường nối", 2)
    add_bullets(doc, [
        "Đường nối này thể hiện quan hệ nghiệp vụ giữa hai thực thể chứ không chỉ để join dữ liệu.",
        "Nếu bỏ foreign key này thì hệ thống sẽ mất khả năng biết bản ghi hiện tại đang thuộc về ai hoặc thuộc ngữ cảnh nào.",
        "Việc tách thành foreign key giúp dữ liệu nhất quán, tránh nhập text tự do và hỗ trợ query/report dễ hơn."
    ])


def add_endpoint_map_section(doc):
    add_page_break(doc)
    add_heading(doc, "16. Bản Đồ Endpoint Và Cách Route Kỹ Thuật Khớp Với Use Case", 1)
    add_paragraph(doc, "Giảng viên đôi khi hỏi rất khó chịu kiểu: use case đó cụ thể vào API nào, actor nào được gọi, controller nào xử lý. Bảng này giúp em nối use case ở mức tài liệu với route ở mức code.")
    add_simple_table(
        doc,
        ["Method", "Path", "Actor", "Mục đích", "Controller -> Service"],
        endpoint_rows,
        [0.7, 1.8, 1.0, 2.0, 2.3],
    )
    add_heading(doc, "16.1 Cách defend route và use case", 2)
    add_bullets(doc, [
        "Một use case không nhất thiết chỉ có một endpoint. Ví dụ place order có thể gồm check stock, create order và callback/payment flow.",
        "Một endpoint là điểm gọi kỹ thuật; use case là mục tiêu nghiệp vụ ở mức người dùng.",
        "Khi bị hỏi từ route sang code, cứ nói theo chuỗi: frontend page -> service JS -> REST endpoint -> Spring controller -> service Java -> repository/table."
    ])
    add_heading(doc, "16.2 Ba route nên thuộc lòng nhất", 2)
    add_bullets(doc, [
        "`POST /api/stock-transactions`: import hàng vào kho.",
        "`POST /api/orders`: tạo order từ checkout.",
        "`GET /api/statistics/...`: lấy dữ liệu aggregate cho dashboard."
    ])


def add_query_patterns_section(doc):
    add_page_break(doc)
    add_heading(doc, "17. Mẫu Query SQL Và Cách Đọc Statistics/Dashboard Query", 1)
    add_paragraph(doc, "Phần này để cứu em khi bị hỏi kiểu: dashboard này lấy số ở đâu, query nhóm như thế nào, tại sao cần join nhiều bảng. Không cần nhớ y nguyên câu SQL; chỉ cần nhớ logic của nó.")
    add_paragraph(doc, "Công thức đọc query rất hữu ích là: `SELECT cái gì`, `FROM bảng gốc nào`, `JOIN thêm bảng nào`, `WHERE lọc gì`, `GROUP BY theo chiều nào`, `ORDER BY để hiển thị thế nào`.")

    for idx, item in enumerate(query_pattern_rows, start=1):
        add_heading(doc, f"17.{idx} {item['title']}", 2)
        add_paragraph(doc, f"Vì sao cần query này: {item['why']}")
        add_paragraph(doc, f"Bảng chính: {item['tables']}")
        add_paragraph(doc, "Pseudo-SQL dễ học:")
        add_code_block(doc, item["sql"])
        add_paragraph(doc, f"Cách defend: {item['defend']}")

    add_heading(doc, "17.7 Những keyword SQL nên hiểu để không bị đứng hình", 2)
    add_bullets(doc, [
        "`LEFT JOIN`: giữ dữ liệu bảng trái kể cả khi bảng phải không có bản ghi.",
        "`COUNT(*)`: đếm số dòng.",
        "`SUM(...)`: cộng giá trị số.",
        "`GROUP BY`: gom các dòng cùng tiêu chí để aggregate.",
        "`CAST(order_date AS DATE)`: cắt phần thời gian để gom theo ngày.",
        "`DATEADD(...)`: tính mốc thời gian động, hay gặp ở thống kê gần N ngày.",
        "`COALESCE(...)`: thay null bằng giá trị mặc định, ví dụ 0."
    ])


def add_tradeoff_section(doc):
    add_page_break(doc)
    add_heading(doc, "18. Trade-off Thiết Kế: Tại Sao Lại Làm Thế Này Mà Không Phải Thế Kia", 1)
    add_paragraph(doc, "Đây là phần cực hợp với kiểu hỏi phản biện. Giảng viên thường không chỉ hỏi bảng này để làm gì, mà còn hỏi tại sao không thiết kế kiểu đơn giản hơn. Không có thiết kế nào miễn phí; bảng sau gom cả lợi ích và cái giá phải trả.")
    add_simple_table(
        doc,
        ["Quyết định", "Lý do chính", "Phương án khác", "Lợi ích", "Cái giá phải trả"],
        tradeoff_rows,
        [1.6, 1.5, 1.5, 1.6, 1.6],
    )
    add_heading(doc, "18.1 Cách trả lời phản biện cho chắc", 2)
    add_bullets(doc, [
        "Thừa nhận luôn là mỗi thiết kế đều có trade-off; đừng nói như thể có một đáp án tuyệt đối.",
        "Nói rõ nhóm em ưu tiên điều gì: dễ CRUD master data, hỗ trợ many-to-many, lưu history audit, hoặc giữ đúng business story của e-commerce.",
        "Nếu bị vặn về độ phức tạp, nói thật là thiết kế này phức tạp hơn nhưng đổi lại biểu diễn nghiệp vụ đúng hơn."
    ])


def add_long_study_plan_section(doc):
    add_page_break(doc)
    add_heading(doc, "19. Lộ Trình Ôn 3 Giờ Và Lộ Trình Ôn Qua Đêm", 1)
    add_paragraph(doc, "Vì em nói vẫn còn 3 tiếng hoặc thậm chí qua sáng hôm sau, nên phần này không còn là ôn gấp nữa mà là lộ trình học có chiều sâu. Mục tiêu của lộ trình này là biến trạng thái từ 'nhớ lơ mơ' sang 'kể được logic bằng lời của mình'.")

    add_heading(doc, "19.1 Nếu có trọn 3 giờ", 2)
    add_numbered(doc, [
        "30 phút đầu: đọc phần Use case, Java/Spring, SQL cơ bản. Mục tiêu là hiểu ngôn ngữ của dự án và không sợ annotation, join, group by nữa.",
        "40 phút tiếp: đọc lookup table, table deep dive và column-level deep dive của các bảng lõi `user`, `product`, `variation`, `stock`, `stock_variation`, `transaction`, `order`, `order_variation_single`.",
        "45 phút tiếp: đi luồng warehouse -> import -> stock history -> place order -> reserve stock -> cancel/return -> statistics. Vừa đọc vừa tự kể thành tiếng.",
        "25 phút tiếp: đọc foreign key map và endpoint map để nối lại business với code.",
        "20 phút tiếp: đọc query patterns và trade-off section. Đây là phần giúp trả lời câu 'tại sao thế này mà không phải thế kia'.",
        "20 phút cuối: đọc script 3 phút, script 7 phút, rồi tự mock trả lời 10 câu bất kỳ trong Q&A."
    ])

    add_heading(doc, "19.2 Nếu có cả buổi tối đến sáng hôm sau", 2)
    add_numbered(doc, [
        "Vòng 1 - dựng xương sống: đọc toàn bộ phần 1 đến phần 8 để nắm câu chuyện hệ thống.",
        "Vòng 2 - dựng schema trong đầu: đọc phần 14 và 15, cố vẽ nháp tay các nhóm bảng `catalog`, `warehouse`, `order`, `pricing`, `engagement`.",
        "Vòng 3 - dựng code map: mở các file trọng điểm theo phần file map, ít nhất đọc qua controller và service của product, brand, stock, stock transaction, order, statistics, account.",
        "Vòng 4 - dựng phản xạ SQL: đọc phần 17 rồi tự viết lại bằng lời xem query đang lấy số gì từ bảng nào.",
        "Vòng 5 - dựng phản xạ defend: đọc trade-off, Q&A, extra Q&A, safe talk. Tự trả lời thành tiếng, không nhìn giấy trong 5-10 phút một lượt.",
        "Vòng 6 - chốt sáng hôm sau: chỉ xem lại lookup table, các bảng lõi, order status, 3 route chính, script 1 phút và script 3 phút."
    ])

    add_heading(doc, "19.3 Cách học để nhớ lâu hơn thay vì chỉ nhồi", 2)
    add_bullets(doc, [
        "Đừng chỉ đọc thụ động. Mỗi phần xong hãy tự nói lại bằng lời của mình trong 30-60 giây.",
        "Khi gặp một bảng, luôn quy nó về một nhãn: master, lookup, transaction, join, header-detail, current state hay history.",
        "Khi gặp một route hoặc use case, luôn hỏi: dữ liệu nào được đọc, dữ liệu nào bị đổi.",
        "Khi gặp một query, luôn hỏi: nó đang đếm, cộng hay lọc cái gì."
    ])

    add_heading(doc, "19.4 Danh sách phải thuộc nếu muốn rất an toàn", 2)
    add_bullets(doc, [
        "Sự khác nhau giữa `product`, `variation`, `variation_single`.",
        "Sự khác nhau giữa `stock`, `stock_variation`, `transaction`.",
        "Sự khác nhau giữa `discount` và `sale`.",
        "Sự khác nhau giữa `order` và `order_variation_single`.",
        "9 trạng thái order và ý nghĩa từng trạng thái.",
        "3 payment method, 2 shipping method, 2 transaction type.",
        "Vì sao phải có bảng nối `product_category`, `sale_product`, `user_discount`.",
        "Vì sao statistics lấy từ order/order detail chứ không lấy từ frontend hoặc product master."
    ])


def add_extra_qa_section(doc):
    add_page_break(doc)
    add_heading(doc, "20. Rapid-Fire Q&A Bổ Sung", 1)
    add_paragraph(doc, "Phần này là batch câu ngắn để luyện phản xạ. Nếu bị hỏi gài liên tục, em dùng các câu này để giữ nhịp nói.")
    for idx, (question, answer) in enumerate(extra_qa_items, start=1):
        add_heading(doc, f"20.{idx} {question}", 2)
        add_paragraph(doc, answer)


def build_document():
    doc = init_document()
    add_title_page(doc)
    add_manual_toc(doc)
    add_section_use_case(doc)
    add_java_foundation(doc)
    add_sql_foundation(doc)
    add_system_overview(doc)
    add_lookup_tables(doc)
    add_table_deep_dive(doc)
    add_flow_section(doc)
    add_file_map_section(doc)
    add_qa_section(doc)
    add_safe_talk_section(doc)
    add_speaking_scripts(doc)
    add_cram_plan(doc)
    add_column_level_section(doc)
    add_fk_map_section(doc)
    add_endpoint_map_section(doc)
    add_query_patterns_section(doc)
    add_tradeoff_section(doc)
    add_long_study_plan_section(doc)
    add_extra_qa_section(doc)
    doc.save(OUTPUT_PATH)


if __name__ == "__main__":
    build_document()
    print(OUTPUT_PATH)
