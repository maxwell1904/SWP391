# Stock Flow Before & After Fix

## 1) Mục tiêu tài liệu
Tài liệu này mô tả bằng chữ cách phần tồn kho đã vận hành trước khi sửa và sau khi sửa, theo kiểu kịch bản thực tế để dễ kiểm tra và trình bày.

## 2) Phạm vi thay đổi
- Backend: tăng độ an toàn cho import, tạo order, reserve stock và bổ sung luồng chỉnh tồn kho thủ công.
- Frontend: bổ sung thao tác chỉnh tồn kho ngay tại màn hình chi tiết kho.

## 3) Trước khi sửa (hành vi cũ)

### 3.1 Luồng nhập kho
- Người dùng nhập danh sách sản phẩm cần nhập và gửi yêu cầu import.
- Hệ thống tạo transaction nhập kho và cộng số lượng.
- Vấn đề chính: khi phát sinh lỗi trong quá trình import, có nguy cơ xử lý dở dang vì lỗi bị bắt lại và trả về thất bại, nhưng không đảm bảo rollback toàn bộ theo kỳ vọng nghiệp vụ.

### 3.2 Luồng tạo đơn hàng
- Frontend có gọi kiểm tra tồn kho trước khi tạo đơn.
- Vấn đề chính: backend chưa ép kiểm tra lại tồn kho ngay trước lúc ghi chi tiết đơn.
- Hệ quả: nếu tồn kho đổi giữa lúc frontend kiểm tra và lúc backend lưu đơn, có thể phát sinh lệch dữ liệu.

### 3.3 Luồng trừ kho khi reserve
- Khi giữ hàng cho đơn, hệ thống trừ tồn kho.
- Vấn đề chính:
  - Cách trừ kho chưa chặt cho trường hợp nhiều kho chứa cùng biến thể.
  - Rủi ro trừ kho không tối ưu và khó kiểm soát khi dữ liệu phân tán nhiều vị trí.

### 3.4 Chỉnh tồn kho sau nhập/xử lý sai lệch
- Chưa có luồng chỉnh kho thủ công rõ ràng để xử lý nhanh các trường hợp lệch số lượng thực tế.

## 4) Sau khi sửa (hành vi mới)

### 4.1 Tài khoản test cố định để chạy demo
- Khi app khởi động, hệ thống tự đảm bảo có tài khoản:
  - admin123 (quyền ADMIN)
  - staff123 (quyền STAFF)
- Mục đích: chạy thử nhanh trong môi trường local, không phụ thuộc thao tác SQL thủ công.

### 4.2 Import kho an toàn hơn
- Bổ sung kiểm tra dữ liệu đầu vào:
  - Danh sách biến thể không được rỗng.
  - Số lượng mỗi biến thể phải lớn hơn 0.
- Khi có lỗi trong import, hệ thống đánh dấu rollback transaction để tránh trạng thái nhập dở dang.

### 4.3 Tạo đơn hàng có kiểm tra stock phía backend
- Trước khi lưu chi tiết đơn, backend luôn kiểm tra lại tồn kho.
- Mục tiêu: chặn trường hợp dữ liệu tồn kho đã thay đổi sau lần kiểm tra ở frontend.

### 4.4 Reserve stock chống âm và xử lý nhiều vị trí kho
- Hệ thống tính tổng tồn khả dụng của biến thể trên các vị trí kho liên quan.
- Nếu tổng không đủ: dừng và báo lỗi rõ ràng.
- Nếu đủ: trừ dần theo từng vị trí cho đến khi đủ số lượng cần reserve.
- Kết quả: tránh trừ âm và giảm rủi ro lệch kho khi biến thể nằm ở nhiều vị trí.

### 4.5 Có luồng chỉnh tồn kho thủ công
- Backend có endpoint chỉnh tồn kho (tăng/giảm), có kiểm tra không cho ra số âm.
- Mỗi lần chỉnh đều ghi transaction tương ứng (IN nếu tăng, OUT nếu giảm).

### 4.6 UI đã tương thích với luồng chỉnh kho mới
- Ở màn hình Warehouse Detail, mỗi dòng biến thể có thêm cụm thao tác:
  - -1
  - +1
  - Custom
- Nút Custom mở form nhập số lượng tăng/giảm và lý do.
- Sau khi chỉnh thành công, danh sách tồn kho tự tải lại để phản ánh số mới.
- Lý do đã nhập được xem lại tại Dashboard > Stock Transaction History, cột Reason.

## 5) Kịch bản kiểm tra nhanh (demo script)

### Kịch bản A: Kiểm tra chỉnh kho thủ công
1. Đăng nhập bằng admin123 hoặc staff123.
2. Vào Dashboard > Warehouse > chọn 1 kho > màn hình chi tiết kho.
3. Chọn một biến thể và bấm +1.
4. Xác nhận số lượng tăng ngay trên danh sách.
5. Bấm -1 để trả về số cũ.
6. Dùng Custom để nhập số tăng/giảm lớn hơn và ghi lý do.
7. Thử nhập mức giảm vượt tồn hiện có để xác nhận hệ thống chặn và báo lỗi.

### Kịch bản B: Kiểm tra import rollback
1. Tạo một lượt import hợp lệ để xác nhận nhập thành công.
2. Tạo lượt import với dữ liệu không hợp lệ (ví dụ quantity <= 0).
3. Xác nhận hệ thống báo thất bại và không để lại trạng thái cộng kho dở dang.

### Kịch bản C: Kiểm tra re-check stock khi tạo đơn
1. Chuẩn bị biến thể có tồn kho thấp.
2. Tạo tình huống thay đổi stock sát thời điểm đặt đơn.
3. Gửi tạo đơn.
4. Xác nhận backend chặn đơn nếu không đủ tồn tại thời điểm lưu đơn.

## 6) So sánh nhanh trước vs sau

### Trước
- Dễ gặp rủi ro lệch dữ liệu khi import lỗi giữa chừng.
- Phụ thuộc kiểm tra stock ở frontend trước tạo đơn.
- Reserve chưa tối ưu khi tồn kho phân tán nhiều vị trí.
- Chưa có đường chỉnh kho thủ công rõ ràng.

### Sau
- Import có rollback khi lỗi.
- Tạo đơn có re-check stock ở backend.
- Reserve có kiểm tổng tồn và trừ theo nhiều vị trí, tránh âm.
- Có API + UI chỉnh kho thủ công để xử lý lệch thực tế nhanh.

## 7) Ghi chú giới hạn hiện tại
- Đây là bản cải tiến gọn cho đồ án môn học, tập trung vào ổn định nghiệp vụ cốt lõi.
- Chưa mở rộng thành workflow kiểm kê/phê duyệt nhiều bước.
- Luồng chỉnh kho đang hướng đến thao tác nhanh cho ADMIN/STAFF trong nội bộ dashboard.
