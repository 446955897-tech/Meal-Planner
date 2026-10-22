<?php
header('Content-Type: application/json; charset=utf-8');

// الاتصال بقاعدة البيانات
$conn = new mysqli("localhost", "root", "", "meal_generator"); // استبدلي اسم القاعدة إن كان مختلفاً

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "فشل الاتصال بقاعدة البيانات"]);
    exit();
}

// استقبال البيانات
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if (!empty($name) && !empty($email) && !empty($message)) {
    // استخدام Prepared Statements للأمان ومنع هجمات SQL Injection
    $stmt = $conn->prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $message);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "تم إرسال رسالتك وبحفظها بنجاح!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "حدث خطأ أثناء حفظ الرسالة"]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "يرجى تعبئة جميع الحقول"]);
}

$conn->close();
?>