/* eslint-env jest */
// helpers
import {tokenize, tokenizeWithPunctuation} from '../src/js/helpers/stringHelpers';

describe('Tokenizer', function() {
  it('tokenize() should return empty array for empty string', function() {
    const string = '';
    const tokens = tokenize(string);
    const expected = [];
    expect(tokens).toEqual(expected);
  });
  it('tokenize() should return empty array for " " string', function() {
    const string = ' ';
    const tokens = tokenize(string);
    const expected = [];
    expect(tokens).toEqual(expected);
  });
  it('tokenize() should return ["asdf"] array for "asdf" string', function() {
    const string = 'asdf';
    const tokens = tokenize(string);
    const expected = ['asdf'];
    expect(tokens).toEqual(expected);
  });
  it('tokenize() should return ["asdf", "qwerty"] array for "asdf qwerty" string', function() {
    const string = 'asdf qwerty';
    const tokens = tokenize(string);
    const expected = ['asdf', 'qwerty'];
    expect(tokens).toEqual(expected);
  });
  it('tokenize() should return ["asdf", "qwerty"] array for "asdf, qwerty." string', function() {
    const string = 'asdf, qwerty.';
    const tokens = tokenize(string);
    const expected = ['asdf','qwerty'];
    expect(tokens).toEqual(expected);
  });
  it('should handle arabic string', function() {
    const string = "لِأَنَّهُ لِمَنْ مِنَ ٱلْمَلَائِكَةِ قَالَ قَطُّ: «أَنْتَ ٱبْنِي، أَنَا ٱلْيَوْمَ وَلَدْتُكَ»؟ وَأَيْضًا: «أَنَا أَكُونُلَهُ أَبًا، وَهُوَ يَكُونُ لِيَ ٱبْنًا»؟";
    const tokens = tokenize(string);
    const expected = ["لِأَنَّهُ", "لِمَنْ", "مِنَ", "ٱلْمَلَائِكَةِ", "قَالَ", "قَطُّ", "أَنْتَ", "ٱبْنِي", "أَنَا", "ٱلْيَوْمَ", "وَلَدْتُكَ", "وَأَيْضًا", "أَنَا", "أَكُونُلَهُ", "أَبًا", "وَهُوَ", "يَكُونُ", "لِيَ", "ٱبْنًا"];
    expect(tokens).toEqual(expected);
  });
});


describe('tokenizeWithPunctuation', function() {
  it('should return empty array for empty string', function() {
    const string = '';
    const tokens = tokenizeWithPunctuation(string);
    const expected = [];
    expect(tokens).toEqual(expected);
  });
  it('should return empty array for " " string', function() {
    const string = ' ';
    const tokens = tokenizeWithPunctuation(string);
    const expected = [];
    expect(tokens).toEqual(expected);
  });
  it('should return ["asdf"] array for "asdf" string', function() {
    const string = 'asdf';
    const tokens = tokenizeWithPunctuation(string);
    const expected = ['asdf'];
    expect(tokens).toEqual(expected);
  });
  it('should return ["asdf", "qwerty"] array for "asdf qwerty" string', function() {
    const string = 'asdf qwerty';
    const tokens = tokenizeWithPunctuation(string);
    const expected = ['asdf', 'qwerty'];
    expect(tokens).toEqual(expected);
  });
  it('should handle punctuation array for "asdf, qwerty." string', function() {
    const string = 'asdf, qwerty.';
    const tokens = tokenizeWithPunctuation(string);
    const expected = ['asdf',',','qwerty','.'];
    expect(tokens).toEqual(expected);
  });
  it('should handle punctuation in arabic string', function() {
    const string = "لِأَنَّهُ لِمَنْ مِنَ ٱلْمَلَائِكَةِ قَالَ قَطُّ: «أَنْتَ ٱبْنِي، أَنَا ٱلْيَوْمَ وَلَدْتُكَ»؟ وَأَيْضًا: «أَنَا أَكُونُلَهُ أَبًا، وَهُوَ يَكُونُ لِيَ ٱبْنًا»؟";
    const tokens = tokenizeWithPunctuation(string);
    const expected = ["لِأَنَّهُ", "لِمَنْ", "مِنَ", "ٱلْمَلَائِكَةِ", "قَالَ", "قَطُّ", ":", "«", "أَنْتَ", "ٱبْنِي", "،", "أَنَا", "ٱلْيَوْمَ", "وَلَدْتُكَ", "»", "؟", "وَأَيْضًا", ":", "«", "أَنَا", "أَكُونُلَهُ", "أَبًا", "،", "وَهُوَ", "يَكُونُ", "لِيَ", "ٱبْنًا", "»", "؟"];
    expect(tokens).toEqual(expected);
  });
  it('should handle punctuation in gujarti string', function() {
    const string = "કેમ કે ઈશ્વરે દૂતોને ક્યારે એવું કહ્યું કે, 'તું મારો દીકરો છે, આજે મેં તને જન્મ આપ્યો છે?' અને વળી, 'હું તેનો પિતા થઈશ અને તે મારો પુત્ર થશે?'";
    const tokens = tokenizeWithPunctuation(string);
    const expected = ["કેમ", "કે", "ઈશ્વરે", "દૂતોને", "ક્યારે", "એવું", "કહ્યું", "કે", ",", "'", "તું", "મારો", "દીકરો", "છે", ",", "આજે", "મેં", "તને", "જન્મ", "આપ્યો", "છે", "?", "'", "અને", "વળી", ",", "'", "હું", "તેનો", "પિતા", "થઈશ", "અને", "તે", "મારો", "પુત્ર", "થશે", "?", "'"];
    expect(tokens).toEqual(expected);
  });
  it('should handle punctuation in croatian string', function() {
    const string = "Ta kome od anđela ikad reče: Ti si sin moj, danas te rodih; ili pak: Ja ću njemu biti otac, a on će meni biti sin.";
    const tokens = tokenizeWithPunctuation(string);
    const expected = ["Ta", "kome", "od", "anđela", "ikad", "reče", ":", "Ti", "si", "sin", "moj", ",", "danas", "te", "rodih", ";", "ili", "pak", ":", "Ja", "ću", "njemu", "biti", "otac", ",", "a", "on", "će", "meni", "biti", "sin", "."];
    expect(tokens).toEqual(expected);
  });
  it('should handle punctuation in kannada string', function() {
    const string = "ಹೇಗೆಂದರೆ - ದೇವರು ತನ್ನ ದೇವದೂತರೊಳಗೆ ಯಾರಿಗಾದರೂ ಎಂದಾದರೂ ಈ ರೀತಿಯಾಗಿ ಹೇಳಿದ್ದುಂಟೋ? - <<ನೀನು ನನ್ನ ಮಗನು; ನಾನೇ ಈ ಹೊತ್ತು ನಿನ್ನನ್ನು ಪಡೆದಿದ್ದೇನೆ.>> <<ನಾನು ಅವನಿಗೆ ತಂದೆಯಾಗಿರುವೆನು, ಅವನು ನನಗೆ ಮಗನಾಗಿರುವನು.>>";
    const tokens = tokenizeWithPunctuation(string);
    const expected = ["ಹೇಗೆಂದರೆ", "-", "ದೇವರು", "ತನ್ನ", "ದೇವದೂತರೊಳಗೆ", "ಯಾರಿಗಾದರೂ", "ಎಂದಾದರೂ", "ಈ", "ರೀತಿಯಾಗಿ", "ಹೇಳಿದ್ದುಂಟೋ", "?", "-", "<<", "ನೀನು", "ನನ್ನ", "ಮಗನು", ";", "ನಾನೇ", "ಈ", "ಹೊತ್ತು", "ನಿನ್ನನ್ನು", "ಪಡೆದಿದ್ದೇನೆ", ".", ">>", "<<", "ನಾನು", "ಅವನಿಗೆ", "ತಂದೆಯಾಗಿರುವೆನು", ",", "ಅವನು", "ನನಗೆ", "ಮಗನಾಗಿರುವನು", ".", ">>"];
    expect(tokens).toEqual(expected);
  });
  it('should handle punctuation in odia string', function() {
    const string = "କାରଣ ଈଶ୍ୱର ଦୂତମାନଙ୍କ ମଧ୍ୟରୁ କାହାକୁ କେବେ ଏହା କହିଅଛନ୍ତି, \"ତୁମ୍ଭେ ଆମ୍ଭର ପୁତ୍ର, ଆଜି ଆମ୍ଭେ ତୁମ୍ଭକୁ ଜନ୍ମ ଦେଇଅଛୁ ?''ପୁନଶ୍ଚ, \"ଆମ୍ଭେ ତାହାଙ୍କର ପିତା ହେବା, ଆଉ ସେ ଆମ୍ଭର ପୁତ୍ର ହେବେ ?''";
    const tokens = tokenizeWithPunctuation(string);
    const expected = ["କାରଣ", "ଈଶ୍ୱର", "ଦୂତମାନଙ୍କ", "ମଧ୍ୟରୁ", "କାହାକୁ", "କେବେ", "ଏହା", "କହିଅଛନ୍ତି", ",", "\"", "ତୁମ୍ଭେ", "ଆମ୍ଭର", "ପୁତ୍ର", ",", "ଆଜି", "ଆମ୍ଭେ", "ତୁମ୍ଭକୁ", "ଜନ୍ମ", "ଦେଇଅଛୁ", "?", "'", "'", "ପୁନଶ୍ଚ", ",", "\"", "ଆମ୍ଭେ", "ତାହାଙ୍କର", "ପିତା", "ହେବା", ",", "ଆଉ", "ସେ", "ଆମ୍ଭର", "ପୁତ୍ର", "ହେବେ", "?", "'", "'"];
    expect(tokens).toEqual(expected);
  });
  // it('should handle punctuation in mga string including apostrophe as contraction or the like.', function() {
  //   const string = "Sapagkat sino sa mga anghel ang pinagsabihan niya kailanman ng, \"Ikaw ay aking anak, ngayon ako ay naging iyong ama?\" At muli, \"Ako'y magiging ama sa kaniya, at siya ay magiging anak sa akin\"?";
  //   const tokens = tokenizeWithPunctuation(string);
  //   const expected = ["Sapagkat", "sino", "sa", "mga", "anghel", "ang", "pinagsabihan", "niya", "kailanman", "ng", ",", "\"", "Ikaw", "ay", "aking", "anak", ",", "ngayon", "ako", "ay", "naging", "iyong", "ama", "?", "\"", "At", "muli", ",", "\"", "Ako'y", "magiging", "ama", "sa", "kaniya", ",", "at", "siya", "ay", "magiging", "anak", "sa", "akin", "\"", "?"];
  //   expect(tokens).toEqual(expected);
  // });
});
