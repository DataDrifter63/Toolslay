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
};
