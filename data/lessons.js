/* 汉语教程 (3rd ed.) Book 1A, lessons 1-8: new words (生词) transcribed from the book.
   Entry: [hanzi, pinyin, part of speech, English, flag]
   flag: ""  core word | "x" extension word listed under a core word | "p" proper noun
   Practice dialogues ("practice") are original, written for this site with each lesson's words.
   The book's own lesson texts live in private/texts.js (local only, not published). */
window.LESSONS = [
{
  n: 1, zh: "你好", py: "Nǐ hǎo", en: "Hello", page: 1, room: "Front Gate",
  words: [
    ["你","nǐ","pron","you (singular)"],
    ["好","hǎo","adj","good; fine"],
    ["你好","nǐ hǎo","","Hello! How are you?"],
    ["一","yī","num","one"],
    ["五","wǔ","num","five"],
    ["八","bā","num","eight"],
    ["大","dà","adj","big"],
    ["不","bù","adv","not"],
    ["口","kǒu","n, mw","mouth; measure word for family members"],
    ["白","bái","adj","white"],
    ["女","nǚ","adj","female"],
    ["马","mǎ","n","horse"]
  ],
  phonetics: { initials: "b p m f d t n l g k h", finals: "a o e i u ü ai ei ao ou" },
  notes: [
    ["Four tones", "Mandarin has 4 tones plus a neutral tone: ā (high, flat), á (rising), ǎ (dip then rise), à (falling). Same syllable, different tone = different word: mā 妈 / má 麻 / mǎ 马 / mà 骂."],
    ["Syllable = initial + final + tone", "Most syllables are an initial (b, p, m…) plus a final (a, o, e…) carrying a tone. When there is no initial, i/u/ü are written yi, wu, yu."],
    ["Where the tone mark goes", "On the main vowel: a > o/e > i/u. In iu and ui the mark goes on the second letter: jiǔ, duì."]
  ],
  practice: [
    ["A","你好！","Nǐ hǎo!","Hello!"],
    ["B","你好！","Nǐ hǎo!","Hello!"],
    ["A","一、五、八。","Yī, wǔ, bā.","One, five, eight."],
    ["B","不大，不白。","Bú dà, bù bái.","Not big, not white."]
  ]
},
{
  n: 2, zh: "汉语不太难", py: "Hànyǔ bú tài nán", en: "Chinese is not very difficult", page: 14, room: "Family Hall",
  words: [
    ["忙","máng","adj","busy"],
    ["吗","ma","part","question particle at the end of a sentence"],
    ["很","hěn","adv","very"],
    ["汉语","Hànyǔ","n","Chinese (language)"],
    ["难","nán","adj","hard; difficult"],
    ["太","tài","adv","excessively; too; over"],
    ["爸爸","bàba","n","dad"],
    ["妈妈","māma","n","mum"],
    ["他","tā","pron","he; him"],
    ["她","tā","pron","she; her"],
    ["男","nán","adj","male"],
    ["哥哥","gēge","n","elder brother"],
    ["弟弟","dìdi","n","younger brother"],
    ["妹妹","mèimei","n","younger sister"]
  ],
  phonetics: { initials: "(review)", finals: "an en ang eng ong" },
  notes: [
    ["Question with 吗", "Add 吗 to the end of a statement to make a yes/no question: 你忙。→ 你忙吗？"],
    ["Third-tone sandhi", "3rd + 3rd → 2nd + 3rd. 你好 is written nǐ hǎo but said ní hǎo. 很好 → hén hǎo."],
    ["Half-third tone", "A 3rd tone before a 1st, 2nd or 4th tone only dips down (no rise): 很忙 hěn máng."],
    ["Neutral tone", "The second syllable of doubled family words is light and short: bàba, māma, gēge, dìdi, mèimei."]
  ],
  practice: [
    ["A","你哥哥忙吗？","Nǐ gēge máng ma?","Is your elder brother busy?"],
    ["B","他很忙。","Tā hěn máng.","He is very busy."],
    ["A","你妹妹忙吗？","Nǐ mèimei máng ma?","Is your younger sister busy?"],
    ["B","她不太忙。","Tā bú tài máng.","She isn't very busy."],
    ["A","汉语难吗？","Hànyǔ nán ma?","Is Chinese hard?"],
    ["B","不太难。","Bú tài nán.","Not too hard."]
  ]
},
{
  n: 3, zh: "明天见", py: "Míngtiān jiàn", en: "See you tomorrow", page: 21, room: "Post Office",
  words: [
    ["学","xué","v","to learn; to study"],
    ["英语","Yīngyǔ","n","English (language)"],
    ["阿拉伯语","Ālābóyǔ","n","Arabic","x"],
    ["德语","Déyǔ","n","German","x"],
    ["俄语","Éyǔ","n","Russian","x"],
    ["法语","Fǎyǔ","n","French","x"],
    ["韩国语","Hánguóyǔ","n","Korean","x"],
    ["日语","Rìyǔ","n","Japanese","x"],
    ["西班牙语","Xībānyáyǔ","n","Spanish","x"],
    ["去","qù","v","to go"],
    ["对","duì","adj","right; correct; true"],
    ["邮局","yóujú","n","post office"],
    ["寄","jì","v","to post; to mail"],
    ["信","xìn","n","letter; mail"],
    ["银行","yínháng","n","bank"],
    ["取","qǔ","v","to draw; to get; to collect"],
    ["钱","qián","n","money"],
    ["明天","míngtiān","n","tomorrow"],
    ["天","tiān","n","day","x"],
    ["见","jiàn","v","to see"],
    ["六","liù","num","six"],
    ["七","qī","num","seven"],
    ["九","jiǔ","num","nine"],
    ["北京","Běijīng","","Beijing, capital of China","p"]
  ],
  phonetics: { initials: "j q x", finals: "ia ie iao iu(iou) ian in iang ing üe üan ün iong" },
  notes: [
    ["Tone change of 不", "不 is 4th tone (bù), but becomes 2nd tone before another 4th tone: 不去 bú qù, 不对 bú duì, 不太 bú tài. Before tones 1-3 it stays bù: 不忙 bù máng."],
    ["Writing i and ü", "With no initial: i → yi/y (ia → ya, ie → ye, iou → you), ü → yu (üe → yue). After j q x the dots of ü are dropped: ju, qu, xu, jue."],
    ["iou → iu", "After an initial, iou is written iu: j + iou → jiu (九 jiǔ, 六 liù)."]
  ],
  practice: [
    ["A","你去银行吗？","Nǐ qù yínháng ma?","Are you going to the bank?"],
    ["B","不去。我去邮局寄信。","Bú qù. Wǒ qù yóujú jì xìn.","No. I'm going to the post office to mail a letter."],
    ["A","你学英语吗？","Nǐ xué Yīngyǔ ma?","Do you study English?"],
    ["B","不，学汉语。","Bù, xué Hànyǔ.","No, I study Chinese."],
    ["A","明天见！","Míngtiān jiàn!","See you tomorrow!"]
  ]
},
{
  n: 4, zh: "你去哪儿", py: "Nǐ qù nǎr", en: "Where are you going", page: 31, room: "Tian'anmen Square",
  words: [
    ["今天","jīntiān","n","today"],
    ["昨天","zuótiān","n","yesterday","x"],
    ["星期","xīngqī","n","week"],
    ["星期一","Xīngqīyī","n","Monday","x"],
    ["星期二","Xīngqī'èr","n","Tuesday","x"],
    ["星期三","Xīngqīsān","n","Wednesday","x"],
    ["星期四","Xīngqīsì","n","Thursday","x"],
    ["星期五","Xīngqīwǔ","n","Friday","x"],
    ["星期六","Xīngqīliù","n","Saturday","x"],
    ["星期天","Xīngqītiān","n","Sunday","x"],
    ["几","jǐ","pron","how many; what; several"],
    ["二","èr","num","two"],
    ["三","sān","num","three"],
    ["四","sì","num","four"],
    ["哪儿","nǎr","pron","where"],
    ["那儿","nàr","pron","there","x"],
    ["我","wǒ","pron","I; me"],
    ["回","huí","v","to come/go back (to)"],
    ["学校","xuéxiào","n","school"],
    ["再见","zàijiàn","v","goodbye"],
    ["对不起","duìbuqǐ","v","I'm sorry"],
    ["没关系","méi guānxi","","it doesn't matter; that's all right"],
    ["天安门","Tiān'ān Mén","","Tian'anmen, a famous monument in Beijing","p"]
  ],
  phonetics: { initials: "z c s", finals: "-i[ɿ] er ua uo uai ui(uei) uan un(uen) uang ueng" },
  notes: [
    ["Days of the week", "星期 + number: 星期一 Monday … 星期六 Saturday. Sunday is 星期天 (or 星期日). Ask: 今天星期几？"],
    ["er and 儿化", "儿 added to a word curls the tongue: 哪 + 儿 → nǎr, 那 + 儿 → nàr. Write it as -r."],
    ["Writing u", "With no initial, u → wu/w: ua → wa, uo → wo, uei → wei, uen → wen. After an initial uei → ui (duì), uen → un."],
    ["Apostrophe", "Put ' before a, o, e that start a new syllable so you can read it: Tiān'ān, Xīngqī'èr."],
    ["V-not-V question", "Put the verb and its negative together: 你去不去？ = Are you going (or not)?"]
  ],
  practice: [
    ["A","今天星期几？","Jīntiān xīngqī jǐ?","What day is it today?"],
    ["B","今天星期四。","Jīntiān Xīngqīsì.","Today is Thursday."],
    ["A","你去哪儿？","Nǐ qù nǎr?","Where are you going?"],
    ["B","我回学校。你去不去？","Wǒ huí xuéxiào. Nǐ qù bu qù?","I'm going back to school. Are you coming?"],
    ["A","对不起，我不去。","Duìbuqǐ, wǒ bú qù.","Sorry, I'm not going."],
    ["B","没关系。再见！","Méi guānxi. Zàijiàn!","That's OK. Bye!"]
  ]
},
{
  n: 5, zh: "这是王老师", py: "Zhè shì Wáng lǎoshī", en: "This is Mr. Wang", page: 41, room: "Tea Room",
  words: [
    ["这","zhè","pron","this"],
    ["是","shì","v","to be (am, are, is)"],
    ["老师","lǎoshī","n","teacher"],
    ["您","nín","pron","you (honorific)"],
    ["请","qǐng","v","please"],
    ["进","jìn","v","to enter; to come in"],
    ["坐","zuò","v","to sit"],
    ["喝","hē","v","to drink"],
    ["茶","chá","n","tea"],
    ["谢谢","xièxie","v","to thank"],
    ["不客气","bú kèqi","","you're welcome"],
    ["客气","kèqi","adj","polite; courteous","x"],
    ["工作","gōngzuò","n, v","job; to work"],
    ["身体","shēntǐ","n","health; body"],
    ["身","shēn","n","body","x"],
    ["十","shí","num","ten"],
    ["日","rì","n","sun; day"],
    ["王","Wáng","","Wang, a Chinese family name","p"]
  ],
  phonetics: { initials: "zh ch sh r", finals: "-i[ʅ] (zhi chi shi ri)" },
  notes: [
    ["您", "您 nín is the polite 'you' for teachers, elders and strangers. Teachers are addressed as surname + 老师: 王老师."],
    ["请 + verb", "请 + verb = polite request: 请进 come in, 请坐 sit down, 请喝茶 have some tea."],
    ["是 sentences", "A 是 B (A is B): 这是王老师。 Negative: 这不是我爸爸。"],
    ["zhi chi shi ri", "The i after zh ch sh r is not 'ee'. It is a buzzing sound with the tongue curled back."]
  ],
  practice: [
    ["A","这是我妈妈。","Zhè shì wǒ māma.","This is my mum."],
    ["B","您好！","Nín hǎo!","Hello!"],
    ["C","你好！请进！请坐！请喝茶！","Nǐ hǎo! Qǐng jìn! Qǐng zuò! Qǐng hē chá!","Hello! Come in! Sit down! Have some tea!"],
    ["B","谢谢！","Xièxie!","Thank you!"],
    ["C","不客气！工作忙吗？","Bú kèqi! Gōngzuò máng ma?","You're welcome! Is work busy?"],
    ["B","很忙。","Hěn máng.","Very busy."]
  ]
},
{
  n: 6, zh: "我学习汉语", py: "Wǒ xuéxí Hànyǔ", en: "I study Chinese", page: 51, room: "Library",
  words: [
    ["请问","qǐngwèn","v","excuse me, may I ask…"],
    ["问","wèn","v","to ask; to inquire","x"],
    ["贵姓","guìxìng","n","your (honourable) family name"],
    ["姓","xìng","v, n","to be surnamed; family name","x"],
    ["叫","jiào","v","to call; to name"],
    ["名字","míngzi","n","name"],
    ["哪","nǎ","pron","which"],
    ["国","guó","n","country; nation"],
    ["人","rén","n","human being; person"],
    ["认识","rènshi","v","to know (a person)"],
    ["高兴","gāoxìng","adj","glad; happy; cheerful"],
    ["也","yě","adv","also; too"],
    ["学习","xuéxí","v","to study; to learn"],
    ["什么","shénme","pron","what"],
    ["发音","fāyīn","n, v","pronunciation; to pronounce"],
    ["汉字","Hànzì","n","Chinese characters"],
    ["书","shū","n","book"],
    ["谁","shéi/shuí","pron","who"],
    ["的","de","part","possessive particle ('s)"],
    ["那","nà","pron","that"],
    ["杂志","zázhì","n","magazine"],
    ["……文","…wén","","(written) language"],
    ["中文","Zhōngwén","n","Chinese","x"],
    ["阿拉伯文","Ālābówén","n","Arabic","x"],
    ["德文","Déwén","n","German","x"],
    ["俄文","Éwén","n","Russian","x"],
    ["法文","Fǎwén","n","French","x"],
    ["韩文","Hánwén","n","Korean","x"],
    ["日文","Rìwén","n","Japanese","x"],
    ["西班牙文","Xībānyáwén","n","Spanish","x"],
    ["英文","Yīngwén","n","English","x"],
    ["朋友","péngyou","n","friend"],
    ["麦克","Màikè","","Mike","p"],
    ["张东","Zhāng Dōng","","Zhang Dong, a Chinese person's name","p"],
    ["张","Zhāng","","Zhang, a Chinese family name","p"],
    ["中国","Zhōngguó","","China","p"],
    ["德国","Déguó","","Germany","p"],
    ["俄国","Éguó","","Russia","p"],
    ["法国","Fǎguó","","France","p"],
    ["韩国","Hánguó","","the Republic of Korea","p"],
    ["美国","Měiguó","","the United States","p"],
    ["日本（国）","Rìběn(guó)","","Japan","p"],
    ["英国","Yīngguó","","the United Kingdom","p"]
  ],
  phonetics: { initials: "", finals: "Word stress (1)" },
  notes: [
    ["请问", "Start a polite question with 请问: 请问，你贵姓？"],
    ["Chinese names", "Surname first, given name second: 张东 = surname 张 + given name 东."],
    ["贵姓 vs 叫什么名字", "您贵姓？ asks politely for the surname. Answer with 我姓…, not 我贵姓. 你叫什么名字？ asks for the full name: 我叫张东。"],
    ["的 for possession", "A 的 B = A's B: 老师的书 the teacher's book, 我朋友的杂志 my friend's magazine."],
    ["Question words stay in place", "Put the question word where the answer goes: 你是哪国人？ → 我是中国人。 这是谁的书？ → 这是老师的书。"]
  ],
  practice: [
    ["A","请问，您贵姓？","Qǐngwèn, nín guìxìng?","Excuse me, what is your surname?"],
    ["B","我姓王，叫王东。","Wǒ xìng Wáng, jiào Wáng Dōng.","My surname is Wang. My name is Wang Dong."],
    ["A","你是哪国人？","Nǐ shì nǎ guó rén?","Where are you from?"],
    ["B","我是中国人。认识你很高兴。","Wǒ shì Zhōngguó rén. Rènshi nǐ hěn gāoxìng.","I'm Chinese. Nice to meet you."],
    ["A","认识你我也很高兴。那是谁的书？","Rènshi nǐ wǒ yě hěn gāoxìng. Nà shì shéi de shū?","Nice to meet you too. Whose book is that?"],
    ["B","那是我朋友的中文书。","Nà shì wǒ péngyou de Zhōngwén shū.","That's my friend's Chinese book."]
  ]
},
{
  n: 7, zh: "你吃什么", py: "Nǐ chī shénme", en: "What would you eat", page: 62, room: "Dining Hall",
  words: [
    ["中午","zhōngwǔ","n","noon"],
    ["吃","chī","v","to eat"],
    ["饭","fàn","n","meal"],
    ["食堂","shítáng","n","dining hall"],
    ["馒头","mántou","n","mantou; steamed bun"],
    ["要","yào","v","to want; to desire"],
    ["个","gè","mw","general measure word"],
    ["米饭","mǐfàn","n","cooked rice"],
    ["米","mǐ","n","rice","x"],
    ["碗","wǎn","n","bowl"],
    ["鸡蛋","jīdàn","n","egg"],
    ["鸡","jī","n","chicken","x"],
    ["蛋","dàn","n","egg","x"],
    ["汤","tāng","n","soup"],
    ["啤酒","píjiǔ","n","beer"],
    ["酒","jiǔ","n","wine; alcoholic drink","x"],
    ["这些","zhèxiē","pron","these"],
    ["些","xiē","mw","some","x"],
    ["一些","yìxiē","num-mw","some; a few; a little","x"],
    ["那些","nàxiē","pron","those","x"],
    ["饺子","jiǎozi","n","jiaozi; dumpling"],
    ["包子","bāozi","n","baozi; steamed stuffed bun"],
    ["面条儿","miàntiáor","n","noodles"],
    ["玛丽","Mǎlì","","Mary","p"]
  ],
  phonetics: { initials: "", finals: "" },
  notes: [
    ["Tone change of 一", "一 is yī alone, in counting and in numbers. Before tones 1, 2, 3 it becomes yì: 一些 yìxiē, 一碗 yì wǎn. Before tone 4 it becomes yí: 一个 yí ge, 一共 yígòng."],
    ["Number + measure word + noun", "Chinese needs a measure word between a number and a noun: 一个馒头, 一碗汤. 个 is the general one."],
    ["几 + measure word", "几 asks 'how many' for small numbers: 你要几个？ 一个。"]
  ],
  practice: [
    ["A","中午你去哪儿吃饭？","Zhōngwǔ nǐ qù nǎr chī fàn?","Where are you going for lunch?"],
    ["B","我去食堂。","Wǒ qù shítáng.","To the dining hall."],
    ["A","你吃什么？","Nǐ chī shénme?","What are you having?"],
    ["B","我吃饺子，要一碗鸡蛋汤。你呢？","Wǒ chī jiǎozi, yào yì wǎn jīdàntāng. Nǐ ne?","Dumplings and a bowl of egg soup. And you?"],
    ["A","我吃米饭，喝啤酒。这些是什么？","Wǒ chī mǐfàn, hē píjiǔ. Zhèxiē shì shénme?","Rice and a beer. What are these?"],
    ["B","这是包子，那是面条儿。","Zhè shì bāozi, nà shì miàntiáor.","These are baozi, those are noodles."]
  ]
},
{
  n: 8, zh: "苹果一斤多少钱", py: "Píngguǒ yì jīn duōshao qián", en: "How much is half a kilo of apples", page: 70, room: "Fruit Market",
  words: [
    ["买","mǎi","v","to buy"],
    ["水果","shuǐguǒ","n","fruit"],
    ["苹果","píngguǒ","n","apple"],
    ["斤","jīn","mw","jin, Chinese unit of weight (1 jin = 0.5 kg)"],
    ["公斤","gōngjīn","mw","kilogram","x"],
    ["多少","duōshao","pron","how much; how many"],
    ["多","duō","adj","many; a lot of","x"],
    ["少","shǎo","adj","few; little","x"],
    ["块","kuài","mw","kuai, basic unit of money (spoken)"],
    ["元","yuán","mw","yuan, basic unit of money (written)","x"],
    ["角","jiǎo","mw","jiao, 1/10 kuai (written)","x"],
    ["毛","máo","mw","mao, 1/10 kuai (spoken)","x"],
    ["分","fēn","mw","fen, 1/100 kuai","x"],
    ["贵","guì","adj","expensive"],
    ["太……了","tài…le","","too; excessively"],
    ["便宜","piányi","adj","inexpensive; cheap"],
    ["（一）点儿","(yì)diǎnr","mw","a little; a bit"],
    ["来","lái","v","to buy (lit. come; 'give me')"],
    ["吧","ba","part","particle for suggestion / mild request"],
    ["还","hái","adv","also; in addition; still"],
    ["别的","bié de","","other"],
    ["橘子","júzi","n","tangerine"],
    ["怎么","zěnme","pron","how"],
    ["卖","mài","v","to sell"],
    ["两","liǎng","num","two (before a measure word)"],
    ["一共","yígòng","adv","altogether"],
    ["给","gěi","v","to give"],
    ["找","zhǎo","v","to give change"]
  ],
  phonetics: { initials: "", finals: "Word stress (2)" },
  notes: [
    ["……吧", "吧 at the end softens a request or suggestion: 便宜点儿吧 make it a bit cheaper. 来五个吧 let's have five."],
    ["二 vs 两", "Before a measure word use 两 liǎng: 两斤, 两个. When counting or in bigger numbers use 二: 二十一, 星期二."],
    ["Money", "Written 元 / 角 / 分, spoken 块 / 毛 / 分. 21.30 → 二十一块三（毛）."],
    ["太……了", "太 + adjective + 了 = too …: 太贵了！ (too expensive!)"],
    ["Prices", "Item + 一斤/一个 + 多少钱？ 苹果一斤多少钱？ Or ask 橘子怎么卖？ (how are the tangerines sold?)"]
  ],
  practice: [
    ["A","您好，您买什么？","Nín hǎo, nín mǎi shénme?","Hello, what would you like?"],
    ["B","橘子一斤多少钱？","Júzi yì jīn duōshao qián?","How much is half a kilo of tangerines?"],
    ["A","五块。","Wǔ kuài.","Five kuai."],
    ["B","太贵了！便宜点儿吧。","Tài guì le! Piányi diǎnr ba.","Too expensive! A bit cheaper, please."],
    ["A","四块五吧。你要多少？","Sì kuài wǔ ba. Nǐ yào duōshao?","4.50 then. How much do you want?"],
    ["B","要两斤。还要三个苹果。一共多少钱？","Yào liǎng jīn. Hái yào sān ge píngguǒ. Yígòng duōshao qián?","Two jin. And three apples. How much altogether?"],
    ["A","一共十二块。","Yígòng shí'èr kuài.","Twelve kuai altogether."],
    ["B","给你二十块。","Gěi nǐ èrshí kuài.","Here's twenty."],
    ["A","找您八块。","Zhǎo nín bā kuài.","Here's eight back."]
  ]
}
];
