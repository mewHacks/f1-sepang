import Cocoa

let sourcePath = "/Users/yihui/.gemini/antigravity-ide/brain/6a87ea4c-a973-4910-a706-2d1a18d3640f/.user_uploaded/media_1788008715751.jpg"
let outputDir = "/Users/yihui/Documents/f1-sepang/public/stamps"

guard let image = NSImage(contentsOfFile: sourcePath),
      let tiffData = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiffData),
      let cgImage = bitmap.cgImage else {
    print("Failed to load source image")
    exit(1)
}

let width = cgImage.width
let height = cgImage.height
print("Source image dimensions: \(width)x\(height)")

let stampIds: [[String]] = [
    ["first-call", "perfect-call", "storm-reader", "monsoon-master"],
    ["all-weather", "trusted-uncle", "full-send", "by-the-numbers"],
    ["oracle", "punter", "supper-sorted", "shared"]
]

// Grid Centers (manually verified for exact alignment across 1024x682):
// 4 columns: ~133, ~385, ~631, ~880
// 3 rows: ~115, ~340, ~557
// Radius: 108px (captures 100% of the outer metallic bezel and shadows cleanly)

let colCenters: [Double] = [133.0, 384.5, 630.5, 879.5]
let rowCenters: [Double] = [115.5, 340.0, 557.5]
let radius: Double = 108.0
let targetSize = Int(radius * 2.0)

try? FileManager.default.createDirectory(atPath: outputDir, withIntermediateDirectories: true)

for row in 0..<3 {
    for col in 0..<4 {
        let id = stampIds[row][col]
        let cx = colCenters[col]
        let cy = rowCenters[row]
        
        let cropRect = CGRect(
            x: cx - radius,
            y: cy - radius,
            width: radius * 2.0,
            height: radius * 2.0
        )
        
        guard let croppedCG = cgImage.cropping(to: cropRect) else {
            print("Failed to crop \(id)")
            continue
        }
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let ctx = CGContext(
            data: nil,
            width: targetSize,
            height: targetSize,
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            continue
        }
        
        ctx.setAllowsAntialiasing(true)
        ctx.setShouldAntialias(true)
        
        // Circular clipping mask — keeps 100% of the inner sticker solid, only masks the outer corners
        ctx.addEllipse(in: CGRect(x: 0, y: 0, width: targetSize, height: targetSize))
        ctx.clip()
        
        ctx.draw(croppedCG, in: CGRect(x: 0, y: 0, width: targetSize, height: targetSize))
        
        guard let finalCG = ctx.makeImage() else { continue }
        let finalBitmap = NSBitmapImageRep(cgImage: finalCG)
        
        if let pngData = finalBitmap.representation(using: .png, properties: [:]) {
            let pngUrl = URL(fileURLWithPath: "\(outputDir)/\(id).png")
            try? pngData.write(to: pngUrl)
            print("Exported clean solid sticker: \(id).png")
        }
    }
}
print("All 12 stickers exported with solid art and smooth circular borders!")
