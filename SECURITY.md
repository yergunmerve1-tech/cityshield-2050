# Güvenlik notu

CityShield 2050 tek sayfalık bir eğitim simülasyonudur. Bu dosya, kodda bulunan kontrolleri ve bilinçli olarak bulunmayanları ayırır. Uygulanmamış bir kontrol burada “var” diye yazılmaz.

## Tehdit modeli

Kullanıcı kendi tarayıcısında kurgusal olay yazar. Saldırganın elindeki olanaklar: forma kötü metin yapıştırmak, LocalStorage’ı elle değiştirmek, sayfayı başka bir site gibi göstermek. Uzak bir sunucu yoktur; bu yüzden sunucu tarafı yetkisi de yoktur.

Hedef: kullanıcı metninin komut olarak çalışmaması, kişisel veri istenmemesi ve simülasyonun gerçek bir sisteme komut göndermemesi.

## Uygulanan kontroller

1. **Ağ yok.** `script.js` içinde `fetch`, `XMLHttpRequest`, `WebSocket` veya uzak yazı tipi yoktur. İçerik güvenlik politikası `connect-src 'none'` der. Politika `index.html` ve `tanitim.html` başlığındadır.

2. **Form dışarı gitmez.** `form-action 'none'` ve `novalidate` ile birlikte gönderim `preventDefault` ile kesilir. Kaydet düğmesi yalnızca yerel fonksiyonu çalıştırır.

3. **Girdi doğrulaması.** `validateForm` başlık için 5–80, not için 0–240 karakter ister. İzinli küme harf, rakam, boşluk, satır sonu ve `. , : ; ! ? ' " ( ) / % + -` işaretleridir. Açılı parantez bu kümede yoktur. Yalnızca noktalama kabul edilmez. Tür, önem ve sistem değerleri sabit listelerden biri olmalıdır.

4. **Güvenli basım.** Görünen kullanıcı metni `createElement` ve `textContent` ile yazılır. Projede `innerHTML`, `insertAdjacentHTML`, `outerHTML` veya `eval` yoktur.

5. **Kayıt yeniden okunur.** `normalizeEvent` kimlik, başlık, not, tarih ve enum alanlarını tekrar kontrol eder. `calculateRisk` aynı üçlüden puanı yeniden üretir. Kayıtlı puan veya seviye uyuşmazsa kayıt atılır, sayılır ve temiz liste yazılır. Savunma cümleleri depodan okunmaz; `adviceFor` her seferinde sabit metin döndürür.

6. **Depo sınırı.** Anahtar yalnızca `cityshield2050.events.v1` dir. En fazla 40 kayıt tutulur. Bozuk JSON veya liste olmayan değer, boş listeye çekilir ve kullanıcıya uyarı gösterilir. Yazma hatası yutulup “kaydedildi” denmez; uyarı metni yazılamadığını söyler.

7. **Kişisel veri istenmez.** Alanlar olay başlığı, tür, önem, sistem ve serbest tatbikat notudur. Örnek metin uydurma bir sensör sapmasıdır. `autocomplete="off"` tarayıcıya kimlik önermemesini söyler. Bu, tarayıcının her durumda uyacağı bir garanti değildir.

8. **Çerçeveleme.** `frame-ancestors 'none'` bu sayfanın başka bir sitede iframe olarak gömülmesini ister. `referrer` politikası `no-referrer` dir. `base-uri 'self'` ve `object-src 'none'` ek kısıtlardır.

9. **Komut dosyası kaynağı.** `script-src 'self'` ve `style-src 'self'` satır içi komut ve satır içi stil kabul etmez. Gösterge yayı SVG özniteliği ile güncellenir; öğe stiline JS ile yazılmaz.

## Uygulanmayanlar

Bunlar eksik diye gizlenmez:

- Hesap, parola, oturum, rol veya yetkilendirme yoktur.
- LocalStorage şifrelenmez ve bütünlük imzası taşımaz. Aynı tarayıcı profilindeki bir kullanıcı veya bu kökene komut çalıştırabilen bir eklenti kayıtları okuyup silebilir.
- Sunucu doğrulaması yoktur çünkü sunucu yoktur. Doğrulama yalnızca bu sayfanın JavaScript’ine güvenir. JavaScript kapatılırsa panel hesaplama yapmaz; `noscript` bunu söyler.
- Hız sınırı, denetim günlüğü, yedekleme ve çok kullanıcılı kilit yoktur. 40 kayıtlık tavan bir kapasite sınırıdır, kötüye kullanım önlemi olarak sunulmaz.
- İçerik güvenlik politikası tarayıcı eklentisini veya kullanıcının kendi geliştirici araçlarını durdurmaz.
- Öneriler tehdit istihbaratı değildir. Sabit cümlelerdir ve bir kurumun müdahale planının yerine geçmez.
- Uygulama gerçek hastane, SCADA, su veya ulaşım ekipmanına bağlanmaz. Hiçbir düğme dış sisteme komut göndermez.

## Kurgusal kapsam

Olay türleri tatbikat senaryosudur. Savunma metinleri masa başı adımlardır: kayıt ayırma, yedek kanal, vardiya notu, tatbikat rolü. İstismar adımı, zararlı yazılım veya tarama komutu üretilmez.
