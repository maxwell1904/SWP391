# Huong Dan Dong Bo Database

Tai lieu nay dung cho SQL Server database `Unleashed` sau khi code da doi:

- `sale` thanh `promotion`
- `discount` thanh `voucher`
- bo chuc nang `rank/membership`, drop bang `rank` va `user_rank`

Co 2 cach dong bo DB. Chon dung cach theo tinh trang DB local cua moi nguoi.

## Cach 1: Giu DB hien tai va giu du lieu cu

Dung cach nay neu DB local dang co data can giu lai: account, product, order, review, cart, wishlist, notification...

Luon backup truoc khi chay migration.

### 1. Pull code moi

```powershell
cd D:\FPT\SWP\ROCKWEAR\SWP391
git checkout devD
git pull origin devD
```

### 2. Cau hinh thong tin SQL Server

Sua `$server`, `$user`, `$password` theo may cua ban.

```powershell
$server = "localhost,1433"
$db = "Unleashed"
$user = "sa"
$password = "<your-password>"
```

Vi du server thuong gap:

```powershell
$server = "localhost,1433"       # SQL Server Docker hoac SQL Server mo port 1433
$server = "localhost\SQLEXPRESS" # SQL Server Express
$server = "localhost"            # SQL Server default instance
```

Khong commit password that vao code.

### 3. Backup DB

Nen backup ra thu muc chac chan co quyen ghi, vi du `C:\Temp`.

```powershell
New-Item -ItemType Directory -Path C:\Temp -Force
$backupPath = "C:\Temp\Unleashed_before_refactor_$(Get-Date -Format yyyyMMdd_HHmmss).bak"
sqlcmd -S $server -U $user -P $password -C -b -Q "BACKUP DATABASE [$db] TO DISK = N'$backupPath' WITH INIT, COMPRESSION"
```

Neu backup loi do quyen folder, doi `$backupPath` sang thu muc backup cua SQL Server tren may ban.

### 4. Chay migration theo dung thu tu

Neu DB cua ban van con ten cu `sale` va `discount`, chay ca 3 script theo thu tu nay:

```powershell
sqlcmd -S $server -d $db -U $user -P $password -C -b -i .\docs\sql\rename-sale-to-promotion.sql
sqlcmd -S $server -d $db -U $user -P $password -C -b -i .\docs\sql\002-rename-discount-to-voucher.sql
sqlcmd -S $server -d $db -U $user -P $password -C -b -i .\docs\sql\003-remove-rank-membership.sql
```

Neu ban da migrate `sale -> promotion` tu dot truoc roi, chay tiep voucher roi remove rank:

```powershell
sqlcmd -S $server -d $db -U $user -P $password -C -b -i .\docs\sql\002-rename-discount-to-voucher.sql
sqlcmd -S $server -d $db -U $user -P $password -C -b -i .\docs\sql\003-remove-rank-membership.sql
```

Neu ban da migrate xong ca promotion va voucher roi, chi can chay script remove rank:

```powershell
sqlcmd -S $server -d $db -U $user -P $password -C -b -i .\docs\sql\003-remove-rank-membership.sql
```

### 5. Kiem tra DB sau migration

```powershell
sqlcmd -S $server -d $db -U $user -P $password -C -Q "SELECT name FROM sys.tables WHERE name IN ('promotion','promotion_product','promotion_status','promotion_type','voucher','voucher_status','voucher_type','user_voucher') ORDER BY name"
```

Kiem tra 2 bang rank da bi xoa. Lenh nay phai khong ra dong nao:

```powershell
sqlcmd -S $server -d $db -U $user -P $password -C -Q "SELECT name FROM sys.tables WHERE name IN ('rank','user_rank') ORDER BY name"
```

Kiem tra con table/column ten cu khong. Lenh nay phai khong ra dong nao:

```powershell
sqlcmd -S $server -d $db -U $user -P $password -C -Q "SELECT t.name AS table_name, c.name AS column_name FROM sys.columns c JOIN sys.tables t ON c.object_id = t.object_id WHERE c.name LIKE '%sale%' OR c.name LIKE '%discount%' OR c.name LIKE '%rank%' OR t.name LIKE '%sale%' OR t.name LIKE '%discount%' OR t.name LIKE '%rank%' ORDER BY t.name, c.name"
```

Neu query thu hai khong ra dong nao thi DB da doi ten dung.

### 6. Start lai app

Backend:

```powershell
cd D:\FPT\SWP\ROCKWEAR\SWP391\unleashed
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
cd D:\FPT\SWP\ROCKWEAR\SWP391\unleashed-frontend
npm install
npm start
```

## Cach 2: Xoa DB cu va tao DB moi tu `migration_full.sql`

Dung cach nay neu ban chap nhan mat DB local cu va tao lai database tu dau.

`migration_full.sql` la file full schema + data mau moi nhat. File nay da co:

- `USE [master]`
- `CREATE DATABASE [Unleashed]` neu DB chua ton tai
- `USE [Unleashed]`
- table/column moi nhat: `promotion`, `voucher`, ...
- khong con bang `rank`, `user_rank`, va column `voucher_rank_requirement`
- data mau trong file script

Vay nen neu da xoa DB `Unleashed`, ban co the chay thang `migration_full.sql`. Khong can chay 3 script migration nua.

### Chay bang sqlcmd

```powershell
cd D:\FPT\SWP\ROCKWEAR\SWP391

$server = "localhost,1433"
$user = "sa"
$password = "<your-password>"

sqlcmd -S $server -U $user -P $password -C -b -i .\migration_full.sql
```

Luu y: lenh nay khong truyen `-d Unleashed` vi file full tu no `USE [master]` roi tu tao/chuyen sang `Unleashed`.

### Chay bang SSMS

1. Backup DB neu con data can giu.
2. Delete database `Unleashed` neu muon tao lai sach.
3. Open file `migration_full.sql`.
4. Bam Execute toan bo file.
5. Refresh Databases, kiem tra co DB `Unleashed`.
6. Start lai backend/frontend.

Neu ban tu tao DB `Unleashed` truoc bang SSMS roi chay `migration_full.sql` cung duoc, mien la DB do dang rong. Neu DB da co table cu thi khong nen chay file full de de len.

## Nen dung cach nao?

| Tinh trang may local | Nen lam |
| --- | --- |
| Co data can giu | Dung Cach 1, chay migration scripts |
| DB cu khong can giu | Dung Cach 2, xoa DB va chay `migration_full.sql` |
| Da pull code moi nhung bao loi table `sale`/`discount` khong ton tai | DB da moi, code co the dang cu hoac build cache cu; pull code moi va restart app |
| Da pull code moi nhung bao loi table `promotion`/`voucher` khong ton tai | Code moi nhung DB chua migrate; chay Cach 1 hoac Cach 2 |
| Da pull code moi nhung bao loi table `rank`/`user_rank` hoac column `voucher_rank_requirement` | DB chua chay script `003-remove-rank-membership.sql`; chay Cach 1 buoc 4 |
| May vua clone project, chua co DB | Dung Cach 2 |

## Loi thuong gap

### `sqlcmd` is not recognized

May chua co SQL Server command line tools. Dung SSMS de execute script, hoac cai Microsoft SQL Server Command Line Utilities.

### Login failed for user `sa`

Sai password, SQL Server chua bat SQL authentication, hoac server name sai.

### A connection was successfully established but SSL provider error

Voi local dev, them `-C` vao lenh `sqlcmd` de trust certificate. Cac lenh trong README da co `-C`.

### Invalid object name `promotion` hoac `voucher`

Backend/frontend da la code moi nhung DB chua dong bo. Chay migration scripts hoac rebuild DB tu `migration_full.sql`.

### Invalid object name `sale` hoac `discount`

DB da doi ten roi nhung code dang cu. Pull lai code moi tren `devD`, restart backend/frontend.

### Invalid object name `rank` hoac `user_rank`

Code da bo membership nhung DB/script local chua dong bo. Chay `docs\sql\003-remove-rank-membership.sql`, hoac neu khong can data local thi xoa DB roi chay lai `migration_full.sql`.

## Checklist gui cho team

```powershell
cd D:\FPT\SWP\ROCKWEAR\SWP391
git checkout devD
git pull origin devD
```

Sau do moi nguoi tu chon:

- Muon giu DB local: backup, roi chay `docs\sql\rename-sale-to-promotion.sql`, `docs\sql\002-rename-discount-to-voucher.sql`, va `docs\sql\003-remove-rank-membership.sql` theo dung thu tu.
- Muon lam DB sach: xoa DB `Unleashed`, roi chay `migration_full.sql`.

Cuoi cung restart backend va frontend.
