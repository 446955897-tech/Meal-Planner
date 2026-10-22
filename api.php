<?php
header("Content-Type: application/json; charset=UTF-8");

// بيانات الاتصال بالخادم المحلي
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "meal_generator";

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["error" => "فشل الاتصال بقاعدة البيانات"]));
}

// استقبال الفلاتر القادمة من طلب الـ JavaScript
$diet = isset($_GET['diet']) ? $_GET['diet'] : '';
$calories = isset($_GET['calories']) ? $_GET['calories'] : '';
$meal_type = isset($_GET['meal_type']) ? $_GET['meal_type'] : '';

// الاستعلام الأساسي
$sql = "SELECT * FROM meals WHERE 1=1";

if (!empty($diet)) {
    $sql .= " AND diet_type = '" . $conn->real_escape_string($diet) . "'";
}
if (!empty($calories)) {
    $sql .= " AND calories = " . intval($calories);
}
if (!empty($meal_type)) {
    $sql .= " AND meal_type = '" . $conn->real_escape_string($meal_type) . "'";
}

$result = $conn->query($sql);
$meals = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $meals[] = $row;
    }
}

$status = "success";

// إذا لم نجد وجبة تطابق جميع الشروط المحددة بالتمام (الدايت + السعرات + نوع الوجبة)
if (empty($meals)) {
    // بناء استعلام البحث عن بدائل مقترحة
    $fallbackSql = "SELECT * FROM meals WHERE 1=1";
    
    // 1. تقييد البدائل بنفس نوع النظام الغذائي المختار (مثل: نباتي أو كيتو)
    if (!empty($diet)) {
        $fallbackSql .= " AND diet_type = '" . $conn->real_escape_string($diet) . "'";
    }
    
    // 2. تقييد البدائل بنفس نوع الوجبة المختار (فطور، غداء، أو عشاء)
    if (!empty($meal_type)) {
        $fallbackSql .= " AND meal_type = '" . $conn->real_escape_string($meal_type) . "'";
    }
    
    $fallbackSql .= " LIMIT 3";
    
    $fallbackResult = $conn->query($fallbackSql);
    if ($fallbackResult) {
        while ($row = $fallbackResult->fetch_assoc()) {
            $meals[] = $row;
        }
    }
    
    // في حال وجود وجبات بديلة تطابق نوع الوجبة والنظام
    if (!empty($meals)) {
        $status = "suggestions";
    }
}

// إرجاع النتيجة بتنسيق JSON
echo json_encode([
    "status" => $status,
    "meals" => $meals
], JSON_UNESCAPED_UNICODE);
