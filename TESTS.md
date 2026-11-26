# Testler

Otomatik test çerçevesi yoktur. Bu dosya birim testlerini geçmiş gibi gösteren bir rapor değildir. Aşağıdaki satırlar elle, tarayıcıda bakılacak senaryolardır.

Sonuç sütunu, bu çalışma oturumunda gerçekten gözlemlenen durumdur. Koşulmayan satır “koşulmadı” kalır.

Ortam: yerel statik sunucu, `http://127.0.0.1:8765/`. Tarih: 26 Kasım 2026.

| No | Senaryo | Beklenen | Sonuç |
| --- | --- | --- | --- |
| 1 | Paneli aç | Beş sistem “Olay yok”, kent hazırlığı 78,4, özet sıfır, geçmiş boş | Koşulmadı |
| 2 | Boş kaydet | Kayıt eklenmez, zorunlu alan hataları görünür | Koşulmadı |
| 3 | Kısa başlık ve `<script>` içeren başlık | İkisi de reddedilir, depo büyümez | Koşulmadı |
| 4 | Örnek senaryoyu kaydet | Puan 76, yüksek, Su hazırlığı 67 ve “Müdahale”, kent hazırlığı 76,2 | Koşulmadı |
| 5 | Sayfayı yenile | Aynı kayıt durur | Koşulmadı |
| 6 | Su filtresi ve Ayrıntı | Yalnızca Su kaydı listelenir, analiz kartı açılır | Koşulmadı |
| 7 | Tek kaydı sil, sonra tüm geçmişi temizle | Liste ve özet boşalır, yenilemeden sonra da boştur | Koşulmadı |
| 8 | Depodaki puanı boz | Kayıt yok sayılır, uyarı görünür | Koşulmadı |
| 9 | Tanıtım bağlantıları | Amaç, güvenlik, demo ve panele dönüş çalışır | Koşulmadı |
| 10 | Dar görünüm | Sütunlar alt alta iner, kaydet düğmesi görünür | Koşulmadı |
| 11 | İkinci sekme senkronu | `storage` olayı diğer sekmeyi günceller | Koşulmadı |
| 12 | 41. kayıt | En fazla 40 kayıt kalır, uyarı eski kaydın düştüğünü söyler | Koşulmadı |

Formül örnekleri kodla aynı kaynaktan panelde de listelenir. Onlar tarayıcıda ayrıca okunmadan burada doğrulanmış sayılmaz.
