// 1. تعريف جميع العناصر من الـ HTML بأسمائها الصحيحة
const generateBtn = document.getElementById('generate-btn');
const dietSelect = document.getElementById('diet-select');
const caloriesInput = document.getElementById('calories-input');
const mealTypeSelect = document.getElementById('meal-type-select');
const mealsContainer = document.getElementById('meals-container');

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
                            <button class="fav-btn" onclick="addToFavorites(${meal.id})">❤️ إضافة للمفضلة</button>
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