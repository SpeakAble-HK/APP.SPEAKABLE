import { useNavigate } from "react-router-dom";
import { MapPin, BookOpen, Languages, Heart, ExternalLink } from "lucide-react";
import mascot from "@/assets/pipi-mascot.png";

const NGO_RESOURCES = [
  { name: '香港言語治療師協會', url: 'https://www.hkist.org.hk', desc: '專業言語治療師組織' },
  { name: '衛生署兒童體能智力測驗服務', url: 'https://www.dhcas.gov.hk', desc: '政府兒童評估服務' },
  { name: '協康會', url: 'https://www.heephong.org', desc: '兒童康復服務' },
  { name: '明愛社區服務', url: 'https://www.caritassws.org.hk', desc: '社區言語治療服務' },
];

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background">
      <section className="px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <img src={mascot} alt="" className="h-16 w-16 object-contain mascot-bounce" />
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">公眾資訊</h1>
              <p className="text-sm text-muted-foreground mt-1">言語治療介紹及資源</p>
            </div>
          </div>

          {/* Speech Therapy Introduction */}
          <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-foreground">什麼是言語治療？</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                言語治療是一門專業的醫療服務，旨在幫助有語言、言語、溝通或吞嚥困難的人士。言語治療師是受過專業訓練的醫療專業人員。
              </p>
              <p>兒童言語治療通常涵蓋以下範疇：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>發音障礙 — 無法正確發出某些語音</li>
                <li>語言發展遲緩 — 語言理解或表達能力低於同齡兒童</li>
                <li>口吃 — 說話不流暢</li>
                <li>聲線問題 — 聲音沙啞或音量異常</li>
                <li>社交溝通困難 — 社交互動中的語言使用</li>
              </ul>
              <p>
                如果您的孩子在說話方面有困難，建議儘早尋求專業評估。早期介入可以顯著改善治療效果。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate('/resources/find-provider')}
                className="bg-primary text-primary-foreground rounded-xl p-4 text-center hover:-translate-y-0.5 transition-all"
                style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
              >
                <MapPin className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-bold block">尋找服務</span>
              </button>
              <button
                onClick={() => navigate('/resources/speech-therapy-info')}
                className="bg-card border-2 border-border rounded-xl p-4 text-center hover:-translate-y-0.5 transition-all hover:border-primary/30"
              >
                <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-sm font-bold text-foreground block">了解更多</span>
              </button>
            </div>
          </div>

          {/* NGO Resources */}
          <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-foreground">非牟利機構資源</h2>
              </div>
            </div>

            <div className="space-y-3">
              {NGO_RESOURCES.map((ngo, i) => (
                <a
                  key={i}
                  href={ngo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{ngo.name}</p>
                    <p className="text-xs text-muted-foreground">{ngo.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* IPA Library link */}
          <button
            onClick={() => navigate('/ipa')}
            className="w-full bg-card border-2 border-border rounded-2xl p-5 text-left hover:-translate-y-0.5 transition-all hover:border-primary/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Languages className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">音標庫</h3>
                <p className="text-sm text-muted-foreground">學習音標符號和發音指南</p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
