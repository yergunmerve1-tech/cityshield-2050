# CityShield 2050

Akıllı Şehirler, Güvenli Yarınlar.

Kurgusal Nova Liman kenti için statik bir siber güvenlik tatbikat panelidir. Hastane, ulaşım, enerji, su ve haberleşme sistemlerinin hazırlığını gösterir. Kullanıcı kurgusal bir olay yazar; sayfa risk puanını tarayıcıda hesaplar ve kaydı LocalStorage’a yazar.

Bu bir güvenlik operasyon merkezi değildir. Ağ taraması yapmaz, sistem kesmez, kişisel veri toplamaz.

## Çalıştırma

Derleme adımı yoktur. Dosyalar bir statik sunucudan açılmalıdır.

GitHub Pages: depoyu kök dizinden yayınlayın. Giriş sayfası `index.html`, tanıtım `tanitim.html` dosyasıdır.

Yerel deneme:

```powershell
python -m http.server 8765
```

Ardından `http://127.0.0.1:8765/` adresini açın. Doğrudan `file://` ile açmak bazı tarayıcılarda içerik güvenlik politikası yüzünden `script.js` dosyasını engelleyebilir. Bu durumda sayfa hesaplama yapmaz.

## Dosyalar

| Dosya | Görevi |
| --- | --- |
| `index.html` | Kontrol paneli |
| `style.css` | Panel ve tanıtım stilleri |
| `script.js` | Hesap, doğrulama, çizim, LocalStorage |
| `logo.svg` | Üst çubuk logosu |
| `favicon.svg` | Sekme ikonu |
| `tanitim.html` | Amaç, özellik, güvenlik, teknoloji, fayda ve demo |
| `SECURITY.md` | Uygulanan önlemler ve uygulanmayanlar |
| `PROMPTS.md` | Bu sürümü üreten istem |
| `TESTS.md` | Elle yapılan doğrulamalar |

## Risk formülü

Katsayılar yüzde cinsinden tam sayıdır. Böylece ikili kayan nokta sapması puana karışmaz.

```
ham = tür tabanı × önem katsayısı × sistem katsayısı
puan = sınırla(yuvarla(ham), 0, 100)
```

Bantlar: 0–39 düşük, 40–69 orta, 70–100 yüksek.

Önem katsayıları: düşük 0,50 · orta 0,78 · yüksek 1,00 · kritik 1,18.

Sistem katsayıları ve olay yokken gösterilen referans hazırlık:

| Sistem | Katsayı | Referans |
| --- | --- | --- |
| Hastane | 1,22 | 84 |
| Ulaşım | 1,08 | 76 |
| Enerji | 1,16 | 80 |
| Su | 1,12 | 78 |
| Haberleşme | 1,04 | 74 |

Tür tabanları: hizmet kesintisi 74, sensör 68, yetkisiz erişim 62, kimlik sapması 56, veri bütünlüğü 52, ağ anomalisi 46, yedekleme 40, iletişim gecikmesi 34.

Hazırlık düşüşü `yuvarla(puan × 0,15)` değeridir. Aynı sistemdeki düşüşler toplanır. Sonuç 15 ile 99 arasında tutulur. Olay olmayan sistem referansta kalır. Kent hazırlığı beş sistemin ortalamasıdır.

Düşük önem, düşük risk bandını garanti etmez. Hizmet kesintisi + düşük önem + hastane = 45, yani orta.

Paneldeki “Puan nasıl hesaplanır?” bölümü aynı sabitlerden üretilir.

## Kayıt

Anahtar: `cityshield2050.events.v1`. En fazla 40 olay tutulur; yenisi gelince en eskisi düşer. Kayıt şeması `script.js` içindeki `normalizeEvent` ile tekrar okunur. Puan, tür / önem / sistem üçlüsünün yeniden hesabıyla uyuşmuyorsa kayıt yok sayılır.

## Arayüz

Dil Türkçedir. Koyu lacivert zemin, neon mavi ve turkuaz çizgiler kullanılır. Dar ekranda sütunlar alt alta iner. `prefers-reduced-motion` açıkken nabız ve giriş animasyonu kapanır.
