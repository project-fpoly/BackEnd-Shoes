### __*DỰ ÁN BÁN GIÀY ONLINE CỦA NHÓM GHOST RIDER*__ 
Phiên bản 1.0.0

Mô tả
Ứng dụng website bán giày online ở Việt Nam.

Tính năng
Xem danh mục sản phẩm giày nam, nữ, trẻ em.
Tìm kiếm nhanh sản phẩm.
Chi tiết sản phẩm, đánh giá, bình luận.
Đặt hàng, thanh toán trực tuyến, giao hàng.
Quản lý đơn hàng, khách hàng.
Cài đặt
Node >= 12
NPM
Clone repo, cd vào thư mục
NPM install
NPM start
Sử dụng
Truy cập localhost:3000
Tham khảo demo tại domain.com
Tài liệu
Xem tại docs.domain.com
Tác giả
Nhóm ghost rider 

Email: ntrkien001@gmail.com

Mong nhận được những góp ý để hoàn thiện dự án.

### __*Quá trình phát triển dự án*__ 
#DF-01
#DF-02
#DF-03
#DF-04
#DF-05
#DF-06
#DF-07
#DF-08
#DF-09
#DF-10
#DF-11
#DF-12
#DF-13
#DF-14
#DF-15
#DF-16
#DF-17
#DF-18
#DF-19
#DF-20
#DF-21
#DF-22
#DF-23
#DF-24
#DF-25
#DF-26
#DF-27
#DF-28
#DF-29
#DF-30
#DF-31
#DF-32
#DF-33
#DF-34
#DF-35
#DF-36
#DF-37
#DF-38
#DF-39
#DF-40 CRUD SHOE (kiennt)
Schema PRODUCT
1.	product_id: Mã duy nhất để xác định sản phẩm, là một chuỗi (String), bắt buộc (required) và không được trùng lặp (unique).
2.	SKU: Mã định danh cho sản phẩm, cũng là một chuỗi (String), không bắt buộc.
3.	name: Tên của sản phẩm, cũng là một chuỗi (String), không bắt buộc.
4.	description: Mô tả chi tiết về sản phẩm, là một chuỗi (String), bắt buộc.
5.	categoryId: ID danh mục của sản phẩm, liên kết (ref) đến "Category", là một ObjectId, không bắt buộc.
6.	brandId: ID thương hiệu của sản phẩm, liên kết (ref) đến "Brand", là một ObjectId, không bắt buộc.
7.	price: Giá của sản phẩm, là một số (Number), bắt buộc và phải lớn hơn hoặc bằng 0. Đồng thời, giá trị này được kiểm tra (validate) bằng một hàm validator tùy chỉnh.
8.	sale: Mức giảm giá của sản phẩm, là một số (Number), bắt buộc và mặc định là 0. Giá trị này cũng phải lớn hơn hoặc bằng 0 và được kiểm tra bằng hàm validator tùy chỉnh.
9.	discount: Giá trị chiết khấu của sản phẩm, là một số (Number), không bắt buộc.
10.	quantity: Số lượng sản phẩm có sẵn trong kho, là một số (Number), bắt buộc và phải lớn hơn hoặc bằng 0. Được kiểm tra bằng hàm validator tùy chỉnh.
11.	sold_count: Số lượng sản phẩm đã bán, là một số (Number), không bắt buộc và mặc định là 0.
12.	rating: Xếp hạng của sản phẩm, là một số (Number), không bắt buộc.
13.	size: Kích thước của sản phẩm, là một chuỗi (String), không bắt buộc.
14.	color: Màu sắc của sản phẩm, là một chuỗi (String), không bắt buộc. Giá trị phải thuộc một trong các giá trị được liệt kê trong enum: "red", "green", "blue", "yellow", "black", "white".
15.	material: Chất liệu của sản phẩm, là một chuỗi (String), không bắt buộc.
16.	release_date: Ngày phát hành sản phẩm, là một đối tượng ngày (Date), không bắt buộc.
17.	images: Một mảng chứa các đường dẫn hình ảnh của sản phẩm, mỗi đường dẫn là một chuỗi (String), không bắt buộc.
18.	video: Đường dẫn đến video của sản phẩm, là một chuỗi (String), không bắt buộc.
19.	blog: ID của bài viết blog liên quan đến sản phẩm, liên kết (ref) đến "Blog", là một ObjectId, không bắt buộc.
20.	warranty: Thông tin về chế độ bảo hành của sản phẩm, là một chuỗi (String), không bắt buộc.
21.	tech_specs: Thông số kỹ thuật của sản phẩm, là một chuỗi (String), không bắt buộc.
22.	stock_status: Tình trạng hàng tồn kho của sản phẩm, là một chuỗi (String), không bắt buộc.
23.	isPublished: Trạng thái công khai của sản phẩm, là một boolean (Boolean), bắt buộc và mặc định là false.
24.	publishedDate: Ngày công bố sản phẩm, là một đối tượng ngày (Date), không bắt buộc.
25.	hits: Số lượt truy cập sản phẩm, là một số (Number), không bắt buộc và mặc định là 0.

#DF-41
#DF-42
#DF-43
#DF-44
#DF-45
#DF-46
#DF-47
#DF-48
#DF-49
#DF-50
