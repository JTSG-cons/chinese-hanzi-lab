// 汉语教程 (3rd ed.) Book 1A, 练习 (exercises) for lessons 1-5, as printed in the book.
// Each row lists items separated by " | " in the order the recording reads them.
// rows: contrast rows (辨音 / 辨音辨调): items in a row differ by initial, final or tone.
// clips are added by data/clips.js (timings in the lesson's 练习 recording).
window.BOOKEX = {
  1: {
    track: "01-4", page: 10,
    rows: [
      { kind: "initial", r: ["ba | pa | da | ta | ga | ka", "bu | pu | du | tu | gu | ku", "bai | pai | dai | tai | gai | kai", "bao | pao | dao | tao | gao | kao"] },
      { kind: "final", r: ["ba | bo | he | fo", "pa | po | ne | mo", "ma | mo | de | bo", "fa | fo | ke | po", "bai | bei | pao | pou", "mai | mei | hao | hou", "gai | gei | kao | kou", "hai | hei | gao | gou"] },
      { kind: "mixed", r: ["bā | pà | dā | tā | hé | fó | gē | kè", "bǐ | pí | dé | tè | hòu | fǒu | gū | kǔ", "bù | pù | dì | tì | hēi | fēi | gǎi | kǎi", "bái | pái | dú | tú | hù | fù | gěi | děi", "běi | péi | dài | tài | hā | fā | gǒu | kǒu"] },
      { kind: "word", r: ["yī hào | bā hào | nǐ hǎo | bù hǎo", "dà mǎ | bái mǎ | dìtú | yìtú", "dài tóu | tái tóu | dà lóu | tǎlóu", "kèfú | kèkǔ | dà yú | dà yǔ", "yǔfǎ | lǐ fà | měihǎo | méi lái"] }
    ],
    questions: []
  },
  2: {
    track: "02-4", page: 17,
    rows: [
      { kind: "word", r: ["bàn gōng | bànkōng | dònghóng | tōnghóng", "hěn nán | hěn lán | hěn lěng | kěnéng", "hěn máng | hěn màn | nánfāng | nán fáng"] }
    ],
    // 回答问题 Answer the questions (p.18) and 完成会话 Complete the dialogues (p.19)
    questions: [
      ["你忙吗？", "Nǐ máng ma?", ["我很忙。", "我不太忙。"]],
      ["汉语难吗？", "Hànyǔ nán ma?", ["汉语不太难。", "汉语很难。"]],
      ["你爸爸好吗？", "Nǐ bàba hǎo ma?", ["他很好。"]],
      ["他忙吗？", "Tā máng ma?", ["他很忙。", "他不忙。"]],
      ["你妈妈好吗？", "Nǐ māma hǎo ma?", ["她很好。"]],
      ["你爸爸妈妈好吗？", "Nǐ bàba māma hǎo ma?", ["他们都很好。"]]
    ]
  },
  3: {
    track: "03-5", page: 27,
    rows: [
      { kind: "mixed", r: ["jī | qī | xī | jū | qū | xū", "jiān | qiān | xiān | jiāng | qiāng | xiāng", "jīn | qīn | xīn | jīng | qīng | xīng", "jiàn | juàn | qián | quán | xiǎn | xuǎn", "jīn | jūn | qín | qún | xīn | xūn", "jí | jú | qǐ | qǔ | xī | xū", "jiā | xià | qīng | xīng | jiǎng | qiáng", "jiào | xiào | qiú | xiū | jiè | qiè", "jiě | xiě | qiáo | xiǎo | jǐng | qǐng"] },
      { kind: "word", r: ["jīqì | jǔ qí | xiūxi | xiūlǐ", "jǔxíng | jùxíng | xūyào | xīyào", "nǚlì | lǚlì | qǔ qián | tíqián", "jīntiān | míngtiān | jīnnián | míngnián", "quánxiàn | quánmiàn | xīnxiān | xīnnián", "dōngbian | xībian | qiánbian | hòubian"] }
    ],
    questions: [
      ["你学英语吗？", "Nǐ xué Yīngyǔ ma?", ["不，学汉语。", "我学汉语。"]],
      ["去北京吗？", "Qù Běijīng ma?", ["对。", "对，去北京。"]],
      ["你去邮局寄信吗？", "Nǐ qù yóujú jì xìn ma?", ["不去。去银行取钱。", "我去邮局寄信。"]],
      ["你去银行吗？", "Nǐ qù yínháng ma?", ["不去。去邮局。", "我去银行取钱。"]]
    ]
  },
  4: {
    track: "04-5", page: 37,
    rows: [
      { kind: "mixed", r: ["zá | cā | sā | zé | cè | sè", "zì | cí | sì | zú | cū | sū", "zǎn | cān | sān | zāng | cāng | sāng", "zěn | cēn | sēn | zēng | céng | sēng"] },
      { kind: "word", r: ["zìdiǎn | cídiǎn | sì diǎn | sì tiān", "zàijiàn | cǎidiàn | xiànzài | bǐsài", "zǔguó | cùjìn | cǎisè | cāicè", "sùdù | dìtú | zájì | cáinéng", "cūnzi | sūnzi | sòngxíng | sòng xìn", "zuótiān | cuòwù | suǒyǐ | zuòyè", "cānjiā | zēngjiā | sàn bù | yǔsǎn", "zuìhòu | suíhòu | dǎsǎo | bá cǎo"] }
    ],
    questions: [
      ["你去哪儿？", "Nǐ qù nǎr?", ["我回学校。", "我去天安门。"]],
      ["你去不去？", "Nǐ qù bu qù?", ["不去，我回学校。", "去。"]],
      ["今天星期几？", "Jīntiān xīngqī jǐ?", ["今天星期一。"]],
      ["你回学校吗？", "Nǐ huí xuéxiào ma?", ["我回学校。", "不回，我去天安门。"]],
      ["对不起！", "Duìbuqǐ!", ["没关系！"]]
    ]
  },
  5: {
    track: "05-4", page: 46,
    rows: [
      { kind: "mixed", r: ["zhī | chī | shì | rì | zhè | chē | shè | rè", "zhàn | chǎn | shān | rán | zhāng | cháng | shàng | ràng", "zhēn | chèn | shén | rén | zhèng | chéng | shēng | réng", "zá | zhá | cā | chá | sǎ | shǎ", "zé | zhé | cè | chè | sè | shè", "zì | zhì | cí | chí | sì | shì"] },
      { kind: "word", r: ["sìshí | shísì | xiūxi | xiāoxi", "zhīdào | chídào | zhēnchéng | zhēnzhèng", "Chángchéng | chǎngzhǎng | Zhōngwén | chōngfèn", "chēzhàn | qīxiàn | chūntiān | qiūtiān", "chéngnián | qīngnián | chuán shang | chuáng shang", "shīwàng | xīwàng | shāng xīn | xiāngxìn", "zhījǐ | shíjī | shènglì | jīnglǐ", "shēnghuó | jǐngguò | shāngdiàn | jiàn miàn", "rènshi | línshí | rénlì | rìlì"] }
    ],
    questions: [
      ["工作忙吗？", "Gōngzuò máng ma?", ["不太忙。", "很忙。"]],
      ["身体好吗？", "Shēntǐ hǎo ma?", ["很好！", "身体很好。"]],
      ["你工作忙吗？", "Nǐ gōngzuò máng ma?", ["不太忙。", "我很忙。"]]
    ]
  }
};
