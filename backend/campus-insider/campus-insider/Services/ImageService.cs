// Services/ImageService.cs
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace campus_insider.Services
{
    public class ImageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly string _uploadPath;
        private readonly string _baseUrl;

        // Allowed image types
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private const int MaxWidth = 1920;
        private const int MaxHeight = 1920;

        public ImageService(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;

            // Store uploads in wwwroot/uploads
            _uploadPath = Path.Combine(_environment.WebRootPath, "uploads", "equipment");

            // Base URL for accessing images
            _baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:5001";

            // Ensure upload directory exists
            Directory.CreateDirectory(_uploadPath);
        }

        public async Task<ServiceResult<ImageUploadResult>> UploadEquipmentImage(IFormFile file)
        {
            // Validation 1: File exists
            if (file == null || file.Length == 0)
                return ServiceResult<ImageUploadResult>.Fail("No file provided.");

            // Validation 2: File size
            if (file.Length > MaxFileSize)
                return ServiceResult<ImageUploadResult>.Fail($"File size must be less than {MaxFileSize / 1024 / 1024}MB.");

            // Validation 3: File extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return ServiceResult<ImageUploadResult>.Fail($"Only {string.Join(", ", _allowedExtensions)} files are allowed.");

            // Validation 4: Verify it's actually an image
            try
            {
                using var image = await Image.LoadAsync(file.OpenReadStream());

                // Validation 5: Check dimensions (optional)
                if (image.Width > MaxWidth * 2 || image.Height > MaxHeight * 2)
                    return ServiceResult<ImageUploadResult>.Fail("Image dimensions are too large.");
            }
            catch
            {
                return ServiceResult<ImageUploadResult>.Fail("Invalid image file.");
            }

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            try
            {
                // Process and save image
                using var fileStream = new FileStream(filePath, FileMode.Create);
                using var image = await Image.LoadAsync(file.OpenReadStream());

                // Resize if too large (maintains aspect ratio)
                if (image.Width > MaxWidth || image.Height > MaxHeight)
                {
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(MaxWidth, MaxHeight),
                        Mode = ResizeMode.Max
                    }));
                }

                // Save as JPEG with quality 85
                await image.SaveAsJpegAsync(fileStream, new JpegEncoder { Quality = 85 });

                var imageUrl = $"{_baseUrl}/uploads/equipment/{uniqueFileName}";

                return ServiceResult<ImageUploadResult>.Ok(new ImageUploadResult
                {
                    FileName = uniqueFileName,
                    OriginalFileName = file.FileName,
                    Url = imageUrl,
                    FilePath = filePath,
                    FileSize = new FileInfo(filePath).Length
                });
            }
            catch (Exception ex)
            {
                // Clean up file if something went wrong
                if (File.Exists(filePath))
                    File.Delete(filePath);

                return ServiceResult<ImageUploadResult>.Fail($"Failed to save image: {ex.Message}");
            }
        }

        public async Task<ServiceResult> DeleteEquipmentImage(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return ServiceResult.Fail("Invalid filename.");

            var filePath = Path.Combine(_uploadPath, fileName);

            if (!File.Exists(filePath))
                return ServiceResult.Fail("File not found.");

            try
            {
                File.Delete(filePath);
                return ServiceResult.Ok();
            }
            catch (Exception ex)
            {
                return ServiceResult.Fail($"Failed to delete image: {ex.Message}");
            }
        }
    }

    public class ImageUploadResult
    {
        public string FileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }
}