import WordCounter from "./word-counter/WordCounter";
import BmiCalculator from "./bmi-calculator/BmiCalculator";
import CaseConverter from "./case-converter/CaseConverter";
import FancyTextGenerator from "./fancy-text-generator/FancyTextGenerator";
import TextToHandwriting from "./text-to-handwriting/TextToHandwriting";
import HashtagGenerator from "./hashtag-generator/HashtagGenerator";
import JsonFormatter from "./json-formatter-validator/JsonFormatter";
import JsonToCsv from "./json-to-csv/JsonToCsv";
import RegexTester from "./regex-tester/RegexTester";
import UrlEncoderDecoder from "./url-encoder-decoder/UrlEncoderDecoder";
import Base64EncoderDecoder from "./base64-encoder-decoder/Base64EncoderDecoder";
import MetaTagsGenerator from "./meta-tags-generator/MetaTagsGenerator";
import RobotsTxtGenerator from "./robots-txt-generator/RobotsTxtGenerator";
import FakeDataGenerator from "./fake-data-generator/FakeDataGenerator";
import PercentageCalculator from "./percentage-calculator/PercentageCalculator";
import ScientificCalculator from "./scientific-calculator/ScientificCalculator";
import GpaCalculator from "./gpa-calculator/GpaCalculator";
import EMICalculator from "./emi-calculator/EMICalculator";
import AgeCalculator from "./age-calculator/AgeCalculator";
import DiscountCalculator from "./discount-calculator/DiscountCalculator";
import UnitConverter from "./unit-converter/UnitConverter";
import LoveCalculator from "./love-calculator/LoveCalculator";
import PasswordGenerator from "./password-generator/PasswordGenerator";
import PassphraseGenerator from "./passphrase-generator/PassphraseGenerator";
import QRCodeGenerator from "./qr-code-generator/QRCodeGenerator";
import RandomNumberGenerator from "./random-number-generator/RandomNumberGenerator";
import BusinessNameGenerator from "./business-name-generator/BusinessNameGenerator";
import ColorPicker from "./color-picker/ColorPicker";
import HexRgbConverter from "./hex-rgb-converter/HexRgbConverter";
import PaletteGenerator from "./palette-generator/PaletteGenerator";
import PdfToImage from "./pdf-to-image/PdfToImage";
import ImageToPDFConverter from "./image-to-pdf/ImageToPDFConverter";
import TextToPDF from "./text-to-pdf-generator/TextToPDF";
import ImageConverter from "./image-converter/ImageConverter";
import ImageResizer from "./image-resizer/ImageResizer";
import BulkImageResizer from "./bulk-image-resizer/BulkImageResizer";
import ImageCompressor from "./image-compressor/ImageCompressor";
import ImageCropTool from "./image-crop-tool/ImageCropTool";
import ImageToTextOCR from "./image-to-text-ocr/ImageToTextOCR";
import ScreenshotToText from "./screenshot-to-text/ScreenshotToText";
import CoinFlipDiceRoller from "./coin-flip-dice-roller/CoinFlipDiceRoller";
import UuidGuidGenerator from "./uuid-guid-generator/UuidGuidGenerator";
import LoremIpsumGenerator from "./lorem-ipsum-generator/LoremIpsumGenerator";
import TextDiffChecker from "./text-diff-checker/TextDiffChecker";
import TextToSpeech from "./text-to-speech/TextToSpeech";
import DuplicateLineRemover from "./duplicate-line-remover/DuplicateLineRemover";
import TextSorter from "./text-sorter/TextSorter";
import SlugGenerator from "./slug-generator/SlugGenerator";
import TextReverser from "./text-reverser/TextReverser";
import ReadabilityChecker from "./readability-score-checker/ReadabilityChecker";
import InstagramBioGenerator from "./instagram-bio-generator/InstagramBioGenerator";
import MarkdownEditorPreviewer from "./markdown-editor-previewer/MarkdownEditorPreviewer";
import HtmlFormatterBeautifier from "./html-formatter-beautifier/HtmlFormatterBeautifier";
import CssFormatterMinifier from "./css-formatter-minifier/CssFormatterMinifier";
import JsFormatterMinifier from "./js-formatter-minifier/JsFormatterMinifier";
import XmlFormatterValidator from "./xml-formatter-validator/XmlFormatterValidator";
import YamlToJsonConverter from "./yaml-to-json-converter/YamlToJsonConverter";
import CronExpressionGenerator from "./cron-expression-generator/CronExpressionGenerator";
import HashGenerator from "./hash-generator/HashGenerator";
import JwtDecoder from "./jwt-decoder/JwtDecoder";
import TimestampConverter from "./timestamp-converter/TimestampConverter";
import ColorContrastChecker from "./color-contrast-checker/ColorContrastChecker";
import LoanCalculator from "./loan-calculator/LoanCalculator";
import MortgageCalculator from "./mortgage-calculator/MortgageCalculator";
import SalaryCalculator from "./salary-calculator/SalaryCalculator";
import TipCalculator from "./tip-calculator/TipCalculator";
import CurrencyConverter from "./currency-converter/CurrencyConverter";
import CalorieCalculator from "./calorie-calculator-tdee/CalorieCalculator";
import MacroCalculator from "./macro-calculator/MacroCalculator";
import RetirementCalculator from "./retirement-calculator/RetirementCalculator";
import CarLoanCalculator from "./car-loan-calculator/CarLoanCalculator";
import InvestmentReturnCalculator from "./investment-return-calculator/InvestmentReturnCalculator";
import WaterIntakeCalculator from "./water-intake-calculator/WaterIntakeCalculator";
import HeartRateZoneCalculator from "./heart-rate-zone-calculator/HeartRateZoneCalculator";
import BreakEvenCalculator from "./break-even-calculator/BreakEvenCalculator";
import CompoundInterestCalculator from "./compound-interest-calculator/CompoundInterestCalculator";
import RomanNumeralConverter from "./roman-numeral-converter/RomanNumeralConverter";
import InvoiceGenerator from "./invoice-generator/InvoiceGenerator";
import ProfitMarginCalculator from "./profit-margin-calculator/ProfitMarginCalculator";
import RandomTeamGenerator from "./random-team-generator/RandomTeamGenerator";
import NicknameGenerator from "./nickname-generator/NicknameGenerator";
import CountdownTimerGenerator from "./countdown-timer-generator/CountdownTimerGenerator";
import UtmLinkBuilder from "./utm-link-builder/UtmLinkBuilder";
import OpenGraphPreviewGenerator from "./open-graph-preview-generator/OpenGraphPreviewGenerator";
import KeywordDensityChecker from "./keyword-density-checker/KeywordDensityChecker";
import MetaDescriptionLengthChecker from "./meta-description-length-checker/MetaDescriptionLengthChecker";
import MemeGenerator from "./meme-generator/MemeGenerator";
import BackgroundRemover from "./background-remover/BackgroundRemover";



// Add a new line here every time a tool's real component is built.
// The slug on the left must match the `slug` field in /src/data/tools.js.
export const TOOL_COMPONENTS = {
  "word-counter": WordCounter,
  "bmi-calculator": BmiCalculator,
  "case-converter": CaseConverter, 
  "fancy-text-generator": FancyTextGenerator,
  "text-to-handwriting": TextToHandwriting,
  "hashtag-generator": HashtagGenerator, 
  "json-formatter-validator": JsonFormatter,
   "json-to-csv": JsonToCsv,
   "regex-tester": RegexTester,
   "url-encoder-decoder": UrlEncoderDecoder,
   "base64-encoder-decoder": Base64EncoderDecoder,
   "meta-tags-generator": MetaTagsGenerator,
   "robots-txt-generator": RobotsTxtGenerator,
   "fake-data-generator": FakeDataGenerator,
   "percentage-calculator": PercentageCalculator,
   "scientific-calculator": ScientificCalculator,
   "gpa-calculator": GpaCalculator,
   "emi-calculator": EMICalculator,
   "age-calculator": AgeCalculator,
   "discount-calculator": DiscountCalculator,
   "unit-converter": UnitConverter,
   "love-calculator": LoveCalculator,
   "password-generator": PasswordGenerator,
   "passphrase-generator": PassphraseGenerator,
   "qr-code-generator": QRCodeGenerator,
   "random-number-generator": RandomNumberGenerator,
   "business-name-generator": BusinessNameGenerator,
   "color-picker": ColorPicker,
   "hex-rgb-converter": HexRgbConverter,
   "palette-generator": PaletteGenerator,
   "pdf-to-image": PdfToImage,
   "image-to-pdf": ImageToPDFConverter,
   "text-to-pdf": TextToPDF,
   "image-converter": ImageConverter,
   "image-resizer": ImageResizer,
   "bulk-image-resizer": BulkImageResizer,
   "image-compressor": ImageCompressor,
   "image-crop-tool": ImageCropTool,
   "image-to-text-ocr": ImageToTextOCR,
   "screenshot-to-text": ScreenshotToText,
   "coin-flip-dice-roller": CoinFlipDiceRoller,
   "uuid-guid-generator": UuidGuidGenerator,
   "lorem-ipsum-generator": LoremIpsumGenerator,
   "text-diff-checker": TextDiffChecker,
   "text-to-speech": TextToSpeech,
   "duplicate-line-remover": DuplicateLineRemover,
   "text-sorter": TextSorter,
   "slug-generator": SlugGenerator,
   "text-reverser": TextReverser,
   "readability-score-checker": ReadabilityChecker,
   "instagram-bio-generator": InstagramBioGenerator,
   "markdown-editor-previewer": MarkdownEditorPreviewer,
   "html-formatter-beautifier": HtmlFormatterBeautifier,
   "css-formatter-minifier": CssFormatterMinifier,
   "js-formatter-minifier": JsFormatterMinifier,
   "xml-formatter-validator": XmlFormatterValidator,
   "yaml-to-json-converter": YamlToJsonConverter,
   "cron-expression-generator": CronExpressionGenerator,
   "hash-generator": HashGenerator,
   "jwt-decoder": JwtDecoder,
   "timestamp-converter": TimestampConverter,
   "color-contrast-checker": ColorContrastChecker,
   "loan-calculator": LoanCalculator,
   "mortgage-calculator": MortgageCalculator,
   "salary-take-home-calculator": SalaryCalculator,
   "tip-calculator": TipCalculator,
   "currency-converter": CurrencyConverter,
   "calorie-calculator-tdee": CalorieCalculator,
   "macro-calculator": MacroCalculator,
   "retirement-savings-calculator": RetirementCalculator,
   "car-loan-calculator": CarLoanCalculator,
   "investment-return-calculator": InvestmentReturnCalculator,
   "water-intake-calculator": WaterIntakeCalculator,
   "heart-rate-zone-calculator": HeartRateZoneCalculator,
   "break-even-calculator": BreakEvenCalculator,
   "compound-interest-calculator": CompoundInterestCalculator,
   "roman-numeral-converter": RomanNumeralConverter,
   "invoice-generator": InvoiceGenerator,
   "profit-margin-calculator": ProfitMarginCalculator,
   "random-team-generator": RandomTeamGenerator,
   "nickname-generator": NicknameGenerator,
   "countdown-timer-generator": CountdownTimerGenerator,
   "utm-link-builder": UtmLinkBuilder,
   "open-graph-preview-generator": OpenGraphPreviewGenerator,
   "keyword-density-checker": KeywordDensityChecker,
   "meta-description-length-checker": MetaDescriptionLengthChecker,
   "meme-generator": MemeGenerator,
   "background-remover": BackgroundRemover,
};
