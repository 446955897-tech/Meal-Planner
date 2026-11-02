// 1. تعريف جميع العناصر من الـ HTML بأسمائها الصحيحة
const generateBtn = document.getElementById('generate-btn');
const dietSelect = document.getElementById('diet-select');
const caloriesInput = document.getElementById('calories-input');
const mealTypeSelect = document.getElementById('meal-type-select');
const mealsContainer = document.getElementById('meals-container');

if (generateBtn) {
generateBtn.addEventListener('click', () => {
    // 2. جلب القيم المختارة من الواجهة
    const selectedDiet = dietSelect.value;
    const maxCalories = caloriesInput.value;
    const selectedMeal = mealTypeSelect.value;

    // 3. بناء رابط الـ API
    const url = `api.php?diet=${encodeURIComponent(selectedDiet)}&calories=${encodeURIComponent(maxCalories)}&meal_type=${encodeURIComponent(selectedMeal)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const mealsContainer = document.getElementById('meals-container');
            mealsContainer.innerHTML = ''; // تفريغ الحاوية

            // 4. التحقق من وجود وجبات داخل المصفوفة
            if (data.meals && data.meals.length > 0) {

                // عرض ملاحظة الاقتراحات إذا كانت النتائج بديلة
                if (data.status === 'suggestions') {
                    const note = document.createElement('div');
                    note.className = 'suggestion-note';
                    note.innerText = 'لم نجد وجبة بالمواصفات المطلوبة بالضبط، ولكن إليك خيارات بديلة ممتازة ';
                    mealsContainer.appendChild(note);
                }

                // 5. التكرار لعرض كل وجبة ككارت
                data.meals.forEach(meal => {
                    const card = `
                      <div class="meal-card">
                         <img src="${meal.image_url || 'images/default.jpg'}" alt="${meal.title}">
                         <div class="meal-card-content">
                            <h3>${meal.title}</h3>
                            <p>${meal.diet_type} | سعرة ${meal.calories}</p>
                            <button class="fav-btn" onclick="toggleFavorite(${meal.id}, '${meal.title}', '${meal.image_url || 'images/default.jpg'}')">❤️ إضافة للمفضلة</button>
                         </div>
                     </div>
                     `;
                    mealsContainer.innerHTML += card;
                });

            } else {
               const noMealsDiv = document.createElement('div');
               noMealsDiv.className = 'no-meals';
               noMealsDiv.innerText = 'عذراً، لا توجد وجبات متاحة لهذه الفئة حالياً.';
               mealsContainer.appendChild(noMealsDiv);
            }
        })
        .catch(error => {
            console.error('حدث خطأ أثناء جلب البيانات:', error);
        });
});
}

function toggleFavorite(id, title, image) {
    // جلب قائمة المفضلة من LocalStorage 
    let favorites = JSON.parse(localStorage.getItem('favoriteMeals')) || [];

    //التحقق مما إذا كانت الوجبة موجودة مسبقاً في القائمة أم لا
    const existingIndex = favorites.findIndex(fav => fav.id === id);

    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
        alert('تمت إزالة الوجبة من المفضلة ❌');

    } else {

        favorites.push({ id, title, image });
        alert('تمت إضافة الوجبة للمفضلة ❤️');
    }
    localStorage.setItem('favoriteMeals', JSON.stringify(favorites));
}
// تشغيل الكود بمجرد تحميل عناصر الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const favContainer = document.getElementById('favorites-container');

    // التأكد من أننا في صفحة المفضلة
    if (favContainer) {
        displayFavorites();
    }
});

// دالة عرض الوجبات المفضلة
function displayFavorites() {
    const favContainer = document.getElementById('favorites-container');
    let favorites = JSON.parse(localStorage.getItem('favoriteMeals')) || [];

    // إذا لم تكن هناك وجبات مفضلة
    if (favorites.length === 0) {
        favContainer.innerHTML = '<p class="empty-msg">لم تقم بإضافة أي وجبة للمفضلة بعد! ❤️</p>';
        return;
    }

    // بناء الـ HTML لكل وجبة مفضلة
    favContainer.innerHTML = favorites.map(meal => `
        <div class="meal-card">
            <img src="${meal.image}" alt="${meal.title}">
            <div class="meal-card-content">
                <h3>${meal.title}</h3>
                <button class="remove-btn" onclick="removeFromFavorites('${meal.id}')">إزالة من المفضلة 🗑️</button>
            </div>
        </div>
    `).join('');
}


// دالة الحذف المباشر من صفحة المفضلة
function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favoriteMeals')) || [];
    
    // تصفية المصفوفة بحذف الوجبة المطابقة تماماً
    favorites = favorites.filter(fav => String(fav.id) !== String(id));
    
    // إعادة حفظ القائمة في LocalStorage
    localStorage.setItem('favoriteMeals', JSON.stringify(favorites));
    
    // إعادة تحديث الواجهة فوراً
    displayFavorites();
}