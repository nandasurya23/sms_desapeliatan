# FE Sync Notes - Backend Final

Dokumen ini merangkum kontrak backend final yang sudah lolos end-to-end test, supaya FE bisa menyesuaikan request, response handling, dan rendering data tanpa menebak-nebak.

## 1) Ringkasan Backend Final

- Semua data user yang sensitif sekarang memakai ownership dari JWT (`req.user.id`).
- Partial update aman: field yang tidak dikirim tidak menghapus nilai lama.
- `profile_picture` sekarang disimpan sebagai path lokal publik, bukan URL storage eksternal.
- `biopori` sudah mengikuti schema yang ada dan memakai status endpoint khusus untuk `isfull` dan `ispanen`.
- `GET /api/transaction/:user_id` tetap ada untuk kompatibilitas, tapi backend mengabaikan `:user_id` dan selalu pakai JWT.

## 2) Perubahan per Domain

### Auth

- `POST /api/register`
  - Backend menyimpan password ke `users.password_hash`.
  - `username` dan `password` wajib.
  - `phone_number`, `email`, `banjar`, `profile_picture` optional.
  - `email` divalidasi format dasar jika dikirim.
- `POST /api/login`
  - Login pakai `username` + `password`.
  - Response sukses mengembalikan JWT.
- Ownership
  - Semua endpoint protected harus kirim `Authorization: Bearer <token>`.

### Profile

- `GET /api/profile`
  - Mengambil data user dari JWT, bukan dari param/body.
  - Return `profile_picture` apa adanya dari DB.
- `PUT /api/profile`
  - Multipart upload tetap pakai field `profile_picture`.
  - File disimpan ke local backend.
  - `users.profile_picture` disimpan sebagai path lokal publik, contoh: `/storage/profile/<filename>`.
  - FE harus prepend base URL backend saat render image.
    - Contoh: `https://backend-domain.com/storage/profile/<filename>`.
  - Partial update aman: field yang tidak dikirim tidak menghapus data lama.

### Biopori

- `POST /api/biopori`
  - `name`, `date`, `time` wajib.
  - `end_date`, `end_time`, `image_url` optional.
  - `image_url` disimpan sebagai string path/URL sesuai flow FE/backend existing.
  - `isfull` dan `ispanen` di-set backend, bukan dari FE.
- `GET /api/biopori`
  - Mengambil data milik user dari JWT.
- `PUT /api/biopori/:id`
  - Partial update aman.
  - Field yang tidak dikirim tidak mengubah nilai lama.
- `PUT /api/biopori/:id/full`
  - Endpoint khusus untuk set `isfull = true`.
- `PUT /api/biopori/:id/harvested`
  - Endpoint khusus untuk set `ispanen = true`.

### Bank Sampah

- `POST /api/add-bank-sampah`
  - Ownership diambil dari JWT.
  - Field relevan: `address`, `weight`, `category`, `images`.
  - `address`, `weight`, `category` wajib.
  - `images` optional.
  - FE tidak perlu mengirim `userId`.

### Transaction

- `POST /api/transaction`
  - Ownership diambil dari JWT.
  - Field relevan: `transaction_id`, `transaction_value`, `transaction_date`.
  - `transaction_id` wajib dan unique.
  - `transaction_value` wajib.
  - `transaction_date` optional, default server time jika tidak dikirim.
- `GET /api/transaction/:user_id`
  - Param `:user_id` diabaikan backend.
  - FE tetap boleh pakai route ini, tetapi data yang kembali selalu milik user JWT.

## 3) Hal yang FE Harus Sesuaikan

- Selalu kirim JWT di header `Authorization`.
- Jangan kirim `user_id` atau `userId` untuk endpoint yang sudah ownership-based.
- Jangan harapkan partial update menghapus field lama jika field tidak dikirim.
- Untuk profile image:
  - simpan dan render path lokal dari `users.profile_picture`
  - prepend base URL backend saat menampilkan image
- Untuk biopori:
  - `name`, `date`, `time` wajib saat create
  - jangan kirim `isfull` atau `ispanen` dari FE
- Untuk transaction:
  - jangan percaya `:user_id` sebagai sumber owner
  - hindari duplicate `transaction_id`

## 4) Field Wajib / Optional

### `users`
- Wajib:
  - `username`
  - `password`
- Optional:
  - `phone_number`
  - `email`
  - `banjar`
  - `profile_picture`

### `biopori`
- Wajib:
  - `name`
  - `date`
  - `time`
- Optional:
  - `end_date`
  - `end_time`
  - `image_url`
- Backend-managed:
  - `isfull`
  - `ispanen`

### `bank_sampah`
- Wajib:
  - `address`
  - `weight`
  - `category`
- Optional:
  - `images`

### `transaction_history`
- Wajib:
  - `transaction_id`
  - `transaction_value`
- Optional:
  - `transaction_date`

## 5) Checklist FE Adjustment

- [ ] Tambahkan JWT ke semua request protected.
- [ ] Hapus asumsi bahwa FE bisa menentukan ownership lewat `user_id`.
- [ ] Update renderer image profile agar memakai base URL backend + `users.profile_picture`.
- [ ] Pastikan form `PUT /api/profile` pakai multipart dan field name `profile_picture`.
- [ ] Pastikan create `biopori` mengirim `name`, `date`, `time`.
- [ ] Jangan kirim `isfull` / `ispanen` dari FE.
- [ ] Handle partial update tanpa mengosongkan field lama.
- [ ] Sesuaikan flow `transaction` agar tidak mengandalkan `:user_id`.
- [ ] Tangani error duplicate `transaction_id` sebagai conflict/duplikat data.
- [ ] Jangan mengharapkan `profile_picture` berupa URL storage eksternal; sekarang path lokal publik.

## Catatan Singkat

- Jika FE mau menampilkan gambar profile, gunakan pola:
  - `const src = backendBaseUrl + profile_picture`
- Contoh:
  - `profile_picture = /storage/profile/avatar.png`
  - render menjadi `https://api-domain.com/storage/profile/avatar.png`
