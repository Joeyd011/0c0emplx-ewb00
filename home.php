<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: dashb.html");
    exit();
}
$user = $_SESSION['user'];
?>

<!DOCTYPE html>
<html>
<head><title>Home</title></head>
<body>
  <div style="position: absolute; top: 10px; left: 10px;">
    Hello <?php echo htmlspecialchars($user); ?>
  </div>
  <h1>Welcome to the Dashboard</h1>
</body>
</html>
