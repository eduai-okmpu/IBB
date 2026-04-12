import re

with open('/Users/yesbolgansattar/Desktop/IBB/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = """            <!-- === NEWS SECTION === -->
            <div class="news-section">
                <div class="news-section-header">
                    <div class="news-badge">
                        <i data-lucide="info" style="width:14px;height:14px;"></i>
                        Платформа жайлы
                    </div>
                    <h2 class="news-title voice-target">Инклюзивті әрі қауіпсіз<br><span>білім беру ортасы</span></h2>
                    <p class="news-subtitle voice-target">Көру қабілеті шектеулі балаларға және барлық оқушыларға арналған ыңғайлы, жарнамасыз әрі қауіпсіз платформа.</p>
                </div>

                <div class="news-ticker-wrapper">
                    <div class="ticker-fade ticker-fade-left"></div>
                    <div class="ticker-fade ticker-fade-right"></div>
                    <div class="news-ticker" id="news-ticker">
                        <div class="news-ticker-track">"""

cards = [
    {
        "icon": "eye",
        "color": "#3182CE",
        "tag": "Инклюзивтілік",
        "title": "ЕББҚ ететін балаларға арналған",
        "desc": "Платформа көру қабілеті шектеулі балаларға толық бейімделген, жоғары контраст пен үлкейтілген қаріптер қолданылады."
    },
    {
        "icon": "shield-check",
        "color": "#38A169",
        "tag": "Қауіпсіздік",
        "title": "100% Вируссыз және қауіпсіз орта",
        "desc": "Сайт зиянды бағдарламалардан толықтай қорғалған, балалардың жеке деректері қатаң сақталып, сыртқа таралмайды."
    },
    {
        "icon": "ban",
        "color": "#E53E3E",
        "tag": "Жарнамасыз",
        "title": "Ешқандай жарнама жоқ",
        "desc": "Оқу процесіне кедергі келтіретін ешқандай жасырын жарнамалар, қалқымалы терезелер немесе спам хабарламалар жоқ."
    },
    {
        "icon": "volume-2",
        "color": "#D69900",
        "tag": "Қолжетімділік",
        "title": "Дыбыстық сүйемелдеу жүйесі",
        "desc": "Сайттағы барлық мәтіндер, тапсырмалар мен түсіндірмелер автоматты түрде дауыстап оқылады (Text-to-Speech)."
    },
    {
        "icon": "mouse-pointer-click",
        "color": "#805AD5",
        "tag": "Ыңғайлылық",
        "title": "Қолдануға өте оңай интерфейс",
        "desc": "Беттегі барлық элементтер түсінікті орналасқан, артық түймелер жоқ. Балалар сайтты интуитивті түрде меңгере алады."
    },
    {
        "icon": "flask-conical",
        "color": "#3182CE",
        "tag": "Интерактивтілік",
        "title": "Көрнекі виртуалды зертханалар",
        "desc": "Құрғақ мәтіннің орнына қолмен басқаруға болатын, нақты физикалық заңдылықтарға негізделген анимациялық зертханалар."
    },
    {
        "icon": "bot",
        "color": "#E53E3E",
        "tag": "Технология",
        "title": "Жасанды интеллект көмекшісі",
        "desc": "Оқушылар кез келген уақытта физика бойынша туындаған сұрақтарын AI көмекшіге қойып, жауап ала алады."
    },
    {
        "icon": "layout-dashboard",
        "color": "#38A169",
        "tag": "Басқару",
        "title": "Мұғалімдерге арналған толық бақылау",
        "desc": "Ұстаздар жеке кабинет арқылы өз сыныбын тіркей алады, олардың үлгерімін және тапсырма нәтижелерін бақылайды."
    }
]

cards_html = ""
for card in cards:
    cards_html += f"""
                            <div class="news-card">
                                <div class="news-card-icon"
                                    style="background: linear-gradient(135deg, {card['color']}22, {card['color']}44); border-color: {card['color']}33;">
                                    <i data-lucide="{card['icon']}" style="color:{card['color']};"></i>
                                </div>
                                <span class="news-card-tag">{card['tag']}</span>
                                <h4>{card['title']}</h4>
                                <p>{card['desc']}</p>
                            </div>"""

# Add it twice for the continuous scrolling effect
full_cards_html = cards_html + "\n                            <!-- Duplicate Set for infinite scroll -->" + cards_html

new_content += full_cards_html + """
                        </div>
                    </div>
                </div>
            </div>
            <!-- === END NEWS SECTION === -->"""

pattern = re.compile(r'<!-- === NEWS SECTION === -->.*?<!-- === END NEWS SECTION === -->', re.DOTALL)
updated = pattern.sub(new_content, content)

with open('/Users/yesbolgansattar/Desktop/IBB/index.html', 'w', encoding='utf-8') as f:
    f.write(updated)
print("done")
