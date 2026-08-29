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

let stampIds: [[String]] = [
    ["first-call", "perfect-call", "storm-reader", "monsoon-master"],
    ["all-weather", "trusted-uncle", "full-send", "by-the-numbers"],
    ["oracle", "punter", "supper-sorted", "shared"]
]

guard let pixelData = cgImage.dataProvider?.data,
      let dataPtr = CFDataGetBytePtr(pixelData) else {
    exit(1)
}

let bytesPerPixel = cgImage.bitsPerPixel / 8
let bytesPerRow = cgImage.bytesPerRow

let cellW = width / 4
let cellH = height / 3

for row in 0..<3 {
    for col in 0..<4 {
        let id = stampIds[row][col]
        
        let startX = col * cellW
        let endX = min((col + 1) * cellW, width)
        let startY = row * cellH
        let endY = min((row + 1) * cellH, height)
        
        var minX = endX
        var maxX = startX
        var minY = endY
        var maxY = startY
        
        for y in startY..<endY {
            for x in startX..<endX {
                let pixelIndex = y * bytesPerRow + x * bytesPerPixel
                let r = Int(dataPtr[pixelIndex])
                let g = Int(dataPtr[pixelIndex + 1])
                let b = Int(dataPtr[pixelIndex + 2])
                
                if (r + g + b) > 35 || max(r, max(g, b)) > 20 {
                    if x < minX { minX = x }
                    if x > maxX { maxX = x }
                    if y < minY { minY = y }
                    if y > maxY { maxY = y }
                }
            }
        }
        
        // Add 6px padding around detected content so borders/glare are never clipped
        let pad = 6
        let cropMinX = max(0, minX - pad)
        let cropMinY = max(0, minY - pad)
        let cropMaxX = min(width, maxX + pad)
        let cropMaxY = min(height, maxY + pad)
        
        let cropW = cropMaxX - cropMinX
        let cropH = cropMaxY - cropMinY
        let cropRect = CGRect(x: cropMinX, y: cropMinY, width: cropW, height: cropH)
        
        guard let croppedCG = cgImage.cropping(to: cropRect) else { continue }
        
        // Create square canvas with transparent background
        let targetSize = max(cropW, cropH)
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let ctx = CGContext(
            data: nil,
            width: targetSize,
            height: targetSize,
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { continue }
        
        ctx.setAllowsAntialiasing(true)
        ctx.setShouldAntialias(true)
        
        let drawX = (targetSize - cropW) / 2
        let drawY = (targetSize - cropH) / 2
        ctx.draw(croppedCG, in: CGRect(x: drawX, y: drawY, width: cropW, height: cropH))
        
        // Now turn outer pure black background pixels into transparent
        guard let renderedCG = ctx.makeImage(),
              let renderedData = renderedCG.dataProvider?.data,
              let renderedPtr = CFDataGetBytePtr(renderedData) else { continue }
        
        guard let cleanCtx = CGContext(
            data: nil,
            width: targetSize,
            height: targetSize,
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { continue }
        
        guard let cleanDataPtr = cleanCtx.data else { continue }
        let cleanByteBuf = cleanDataPtr.bindMemory(to: UInt8.self, capacity: targetSize * targetSize * 4)
        
        let centerX = Double(targetSize) / 2.0
        let centerY = Double(targetSize) / 2.0
        let maxAllowedRadius = Double(targetSize) / 2.0 - 1.0
        
        for y in 0..<targetSize {
            for x in 0..<targetSize {
                let offset = (y * targetSize + x) * 4
                let r = Double(renderedPtr[offset])
                let g = Double(renderedPtr[offset + 1])
                let b = Double(renderedPtr[offset + 2])
                
                let dist = sqrt(pow(Double(x) - centerX, 2) + pow(Double(y) - centerY, 2))
                
                // Black threshold or outside circle
                let brightness = r + g + b
                if dist > maxAllowedRadius || (dist > (maxAllowedRadius - 20) && brightness < 18) {
                    cleanByteBuf[offset] = 0
                    cleanByteBuf[offset + 1] = 0
                    cleanByteBuf[offset + 2] = 0
                    cleanByteBuf[offset + 3] = 0
                } else {
                    cleanByteBuf[offset] = UInt8(r)
                    cleanByteBuf[offset + 1] = UInt8(g)
                    cleanByteBuf[offset + 2] = UInt8(b)
                    cleanByteBuf[offset + 3] = 255
                }
            }
        }
        
        guard let finalCG = cleanCtx.makeImage() else { continue }
        let finalBitmap = NSBitmapImageRep(cgImage: finalCG)
        if let pngData = finalBitmap.representation(using: .png, properties: [:]) {
            let pngUrl = URL(fileURLWithPath: "\(outputDir)/\(id).png")
            try? pngData.write(to: pngUrl)
        }
        print("Processed \(id).png with full outer bezel & zero clipping")
    }
}
