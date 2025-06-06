export default [
  {
    title: "Привітання",
    description: "Вивчіть основні привітання та представлення себе англійською мовою.",
    icon: "👋",
    difficulty: "beginner",
    category: "conversation",
    order: 1,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["greetings", "introduction", "basics"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "Привіт" англійською?',
        correctAnswer: "Hello",
        options: ["Hello", "Goodbye", "Thank you", "Sorry"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "Доброго ранку" англійською?',
        correctAnswer: "Good morning",
        options: ["Good morning", "Good evening", "Good night", "Good afternoon"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Мене звати Олена"',
        correctAnswer: "My name is Olena",
      },
      {
        type: "multiple-choice",
        question: 'Як запитати "Як справи?" англійською?',
        correctAnswer: "How are you?",
        options: ["How are you?", "What is your name?", "Where are you from?", "How old are you?"],
      },
      {
        type: "sentence-completion",
        question: "Доповніть речення:",
        correctAnswer: "Nice to meet you",
        options: ["Nice to meet you", "Good to see you", "Happy to know you", "Glad to meet you"],
      },
    ],
  },
  {
    title: "Числа",
    description: "Вивчіть числа від 1 до 100 англійською мовою.",
    icon: "🔢",
    difficulty: "beginner",
    category: "vocabulary",
    order: 2,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["numbers", "counting", "basics"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "п\'ять" англійською?',
        correctAnswer: "five",
        options: ["five", "four", "six", "seven"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "двадцять три"',
        correctAnswer: "twenty-three",
      },
      {
        type: "matching",
        question: "З'єднайте числа з їх написанням англійською",
        correctAnswer: [
          { left: "12", right: "twelve" },
          { left: "15", right: "fifteen" },
          { left: "30", right: "thirty" },
          { left: "50", right: "fifty" },
        ],
        options: [
          { left: "12", right: "twelve" },
          { left: "15", right: "fifteen" },
          { left: "30", right: "thirty" },
          { left: "50", right: "fifty" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Скільки днів у тижні?",
        correctAnswer: "There are seven days in a week",
        options: [
          "There are seven days in a week",
          "There are five days in a week",
          "There are six days in a week",
          "There are eight days in a week",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "сто" англійською?',
        correctAnswer: "one hundred",
        options: ["one hundred", "hundred", "hundreds", "a hundred"],
      },
    ],
  },
  {
    title: "Сім'я",
    description: "Вивчіть слова, пов'язані з сім'єю та родинними зв'язками.",
    icon: "👪",
    difficulty: "beginner",
    category: "vocabulary",
    order: 3,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["family", "relationships", "people"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "мати" англійською?',
        correctAnswer: "mother",
        options: ["mother", "father", "sister", "brother"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Моя бабуся готує смачні пироги"',
        correctAnswer: "My grandmother cooks delicious pies",
      },
      {
        type: "matching",
        question: "З'єднайте слова з їх перекладом",
        correctAnswer: [
          { left: "дядько", right: "uncle" },
          { left: "тітка", right: "aunt" },
          { left: "брат", right: "brother" },
          { left: "сестра", right: "sister" },
        ],
        options: [
          { left: "дядько", right: "uncle" },
          { left: "тітка", right: "aunt" },
          { left: "брат", right: "brother" },
          { left: "сестра", right: "sister" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Хто це: мамина сестра?",
        correctAnswer: "My aunt is my mother's sister",
        options: [
          "My aunt is my mother's sister",
          "My uncle is my mother's brother",
          "My cousin is my mother's sister",
          "My niece is my mother's sister",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "двоюрідний брат" англійською?',
        correctAnswer: "cousin",
        options: ["cousin", "nephew", "uncle", "brother-in-law"],
      },
    ],
  },
  {
    title: "Їжа",
    description: "Вивчіть назви продуктів харчування та страв англійською мовою.",
    icon: "🍎",
    difficulty: "beginner",
    category: "vocabulary",
    order: 4,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["food", "meals", "fruits", "vegetables"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "яблуко" англійською?',
        correctAnswer: "apple",
        options: ["apple", "orange", "banana", "pear"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Я люблю їсти піцу"',
        correctAnswer: "I love to eat pizza",
      },
      {
        type: "matching",
        question: "З'єднайте продукти з їх перекладом",
        correctAnswer: [
          { left: "хліб", right: "bread" },
          { left: "молоко", right: "milk" },
          { left: "вода", right: "water" },
          { left: "м'ясо", right: "meat" },
        ],
        options: [
          { left: "хліб", right: "bread" },
          { left: "молоко", right: "milk" },
          { left: "вода", right: "water" },
          { left: "м'ясо", right: "meat" },
        ],
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["For", "breakfast", "I", "usually", "have", "bacon", "and", "eggs"],
        options: ["For", "breakfast", "I", "usually", "have", "bacon", "and", "eggs"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "вечеря" англійською?',
        correctAnswer: "dinner",
        options: ["dinner", "lunch", "breakfast", "supper"],
      },
    ],
  },
  {
    title: "Кольори",
    description: "Вивчіть назви кольорів англійською мовою.",
    icon: "🎨",
    difficulty: "beginner",
    category: "vocabulary",
    order: 5,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["colors", "basics", "description"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "червоний" англійською?',
        correctAnswer: "red",
        options: ["red", "blue", "green", "yellow"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Небо блакитне"',
        correctAnswer: "The sky is blue",
      },
      {
        type: "matching",
        question: "З'єднайте кольори з їх перекладом",
        correctAnswer: [
          { left: "чорний", right: "black" },
          { left: "білий", right: "white" },
          { left: "коричневий", right: "brown" },
          { left: "сірий", right: "grey" },
        ],
        options: [
          { left: "чорний", right: "black" },
          { left: "білий", right: "white" },
          { left: "коричневий", right: "brown" },
          { left: "сірий", right: "grey" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Якого кольору трава?",
        correctAnswer: "The grass is green",
        options: ["The grass is green", "The grass is blue", "The grass is yellow", "The grass is brown"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "фіолетовий" англійською?',
        correctAnswer: "purple",
        options: ["purple", "pink", "orange", "brown"],
      },
    ],
  },
  {
    title: "Тварини",
    description: "Вивчіть назви тварин англійською мовою.",
    icon: "🐶",
    difficulty: "beginner",
    category: "vocabulary",
    order: 6,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["animals", "pets", "wildlife"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "кіт" англійською?',
        correctAnswer: "cat",
        options: ["cat", "dog", "bird", "fish"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Слони дуже великі"',
        correctAnswer: "Elephants are very big",
      },
      {
        type: "matching",
        question: "З'єднайте тварин з їх перекладом",
        correctAnswer: [
          { left: "лев", right: "lion" },
          { left: "тигр", right: "tiger" },
          { left: "ведмідь", right: "bear" },
          { left: "вовк", right: "wolf" },
        ],
        options: [
          { left: "лев", right: "lion" },
          { left: "тигр", right: "tiger" },
          { left: "ведмідь", right: "bear" },
          { left: "вовк", right: "wolf" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Яка тварина може літати?",
        correctAnswer: "A bird can fly",
        options: ["A bird can fly", "A cat can fly", "A dog can fly", "A fish can fly"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "жираф" англійською?',
        correctAnswer: "giraffe",
        options: ["giraffe", "zebra", "monkey", "hippo"],
      },
    ],
  },
  {
    title: "Одяг",
    description: "Вивчіть назви предметів одягу англійською мовою.",
    icon: "👕",
    difficulty: "intermediate",
    category: "vocabulary",
    order: 7,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["clothes", "fashion", "shopping"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "сорочка" англійською?',
        correctAnswer: "shirt",
        options: ["shirt", "pants", "shoes", "hat"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Я купила нову сукню"',
        correctAnswer: "I bought a new dress",
      },
      {
        type: "matching",
        question: "З'єднайте предмети одягу з їх перекладом",
        correctAnswer: [
          { left: "шкарпетки", right: "socks" },
          { left: "рукавички", right: "gloves" },
          { left: "взуття", right: "shoes" },
          { left: "шапка", right: "hat" },
        ],
        options: [
          { left: "шкарпетки", right: "socks" },
          { left: "рукавички", right: "gloves" },
          { left: "взуття", right: "shoes" },
          { left: "шапка", right: "hat" },
        ],
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["In", "winter", "I", "wear", "a", "warm", "coat"],
        options: ["In", "winter", "I", "wear", "a", "warm", "coat"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "спідниця" англійською?',
        correctAnswer: "skirt",
        options: ["skirt", "dress", "blouse", "jeans"],
      },
    ],
  },
  {
    title: "Погода",
    description: "Вивчіть слова та фрази, пов'язані з погодою.",
    icon: "☀️",
    difficulty: "intermediate",
    category: "vocabulary",
    order: 8,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["weather", "seasons", "climate"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "дощ" англійською?',
        correctAnswer: "rain",
        options: ["rain", "snow", "wind", "cloud"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Сьогодні сонячно"',
        correctAnswer: "It is sunny today",
      },
      {
        type: "matching",
        question: "З'єднайте погодні явища з їх перекладом",
        correctAnswer: [
          { left: "гроза", right: "thunderstorm" },
          { left: "туман", right: "fog" },
          { left: "веселка", right: "rainbow" },
          { left: "град", right: "hail" },
        ],
        options: [
          { left: "гроза", right: "thunderstorm" },
          { left: "туман", right: "fog" },
          { left: "веселка", right: "rainbow" },
          { left: "град", right: "hail" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Нижче якої температури за Цельсієм вода замерзає?",
        correctAnswer: "The temperature is below zero",
        options: [
          "The temperature is below zero",
          "The temperature is below ten",
          "The temperature is below twenty",
          "The temperature is below thirty",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як запитати "Яка сьогодні погода?" англійською?',
        correctAnswer: "What is the weather like today?",
        options: [
          "What is the weather like today?",
          "How is the weather?",
          "Is it good weather?",
          "What weather is it?",
        ],
      },
    ],
  },
  {
    title: "Транспорт",
    description: "Вивчіть назви різних видів транспорту та пов'язані з ними фрази.",
    icon: "🚗",
    difficulty: "intermediate",
    category: "vocabulary",
    order: 9,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["transport", "travel", "vehicles"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "автобус" англійською?',
        correctAnswer: "bus",
        options: ["bus", "car", "train", "plane"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Я їду на роботу на велосипеді"',
        correctAnswer: "I go to work by bicycle",
      },
      {
        type: "matching",
        question: "З'єднайте види транспорту з їх перекладом",
        correctAnswer: [
          { left: "корабель", right: "ship" },
          { left: "літак", right: "plane" },
          { left: "потяг", right: "train" },
          { left: "мотоцикл", right: "motorcycle" },
        ],
        options: [
          { left: "корабель", right: "ship" },
          { left: "літак", right: "plane" },
          { left: "потяг", right: "train" },
          { left: "мотоцикл", right: "motorcycle" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Який транспорт використовують для перетину каналу?",
        correctAnswer: "We took a ferry across the English Channel",
        options: [
          "We took a ferry across the English Channel",
          "We took a boat across the English Channel",
          "We took a ship across the English Channel",
          "We took a yacht across the English Channel",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "метро" англійською (британський варіант)?',
        correctAnswer: "underground",
        options: ["underground", "subway", "metro", "tube"],
      },
    ],
  },
  {
    title: "Час і дати",
    description: "Вивчіть, як говорити про час, дні тижня, місяці та дати.",
    icon: "🕒",
    difficulty: "intermediate",
    category: "vocabulary",
    order: 10,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["time", "dates", "calendar", "days", "months"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "понеділок" англійською?',
        correctAnswer: "Monday",
        options: ["Monday", "Tuesday", "Wednesday", "Sunday"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Зараз пів на третю"',
        correctAnswer: "It is half past two",
      },
      {
        type: "matching",
        question: "З'єднайте місяці з їх перекладом",
        correctAnswer: [
          { left: "січень", right: "January" },
          { left: "лютий", right: "February" },
          { left: "березень", right: "March" },
          { left: "квітень", right: "April" },
        ],
        options: [
          { left: "січень", right: "January" },
          { left: "лютий", right: "February" },
          { left: "березень", right: "March" },
          { left: "квітень", right: "April" },
        ],
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["There", "are", "twelve", "months", "in", "a", "year"],
        options: ["There", "are", "twelve", "months", "in", "a", "year"],
      },
      {
        type: "multiple-choice",
        question: 'Як запитати "Котра година?" англійською?',
        correctAnswer: "What time is it?",
        options: ["What time is it?", "What is the time?", "How many hours?", "When is it?"],
      },
    ],
  },
  {
    title: "Дім і меблі",
    description: "Вивчіть назви кімнат, меблів та предметів домашнього вжитку.",
    icon: "🏠",
    difficulty: "intermediate",
    category: "vocabulary",
    order: 11,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["home", "furniture", "rooms", "household"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "кухня" англійською?',
        correctAnswer: "kitchen",
        options: ["kitchen", "bathroom", "bedroom", "living room"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "У вітальні є великий диван"',
        correctAnswer: "There is a big sofa in the living room",
      },
      {
        type: "matching",
        question: "З'єднайте предмети меблів з їх перекладом",
        correctAnswer: [
          { left: "стіл", right: "table" },
          { left: "стілець", right: "chair" },
          { left: "ліжко", right: "bed" },
          { left: "шафа", right: "wardrobe" },
        ],
        options: [
          { left: "стіл", right: "table" },
          { left: "стілець", right: "chair" },
          { left: "ліжко", right: "bed" },
          { left: "шафа", right: "wardrobe" },
        ],
      },
      {
        type: "sentence-completion",
        question: "В якій кімнаті чистять зуби?",
        correctAnswer: "I brush my teeth in the bathroom",
        options: [
          "I brush my teeth in the bathroom",
          "I brush my teeth in the kitchen",
          "I brush my teeth in the bedroom",
          "I brush my teeth in the living room",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "холодильник" англійською?',
        correctAnswer: "refrigerator",
        options: ["refrigerator", "oven", "microwave", "dishwasher"],
      },
    ],
  },
  {
    title: "Хобі та дозвілля",
    description: "Вивчіть слова та фрази, пов'язані з хобі та проведенням вільного часу.",
    icon: "🎭",
    difficulty: "advanced",
    category: "vocabulary",
    order: 12,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["hobbies", "leisure", "free time", "activities"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "читати книги" англійською?',
        correctAnswer: "to read books",
        options: ["to read books", "to watch books", "to see books", "to look books"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Моє хобі - гра на гітарі"',
        correctAnswer: "My hobby is playing the guitar",
      },
      {
        type: "matching",
        question: "З'єднайте хобі з їх перекладом",
        correctAnswer: [
          { left: "малювання", right: "drawing" },
          { left: "плавання", right: "swimming" },
          { left: "танці", right: "dancing" },
          { left: "спів", right: "singing" },
        ],
        options: [
          { left: "малювання", right: "drawing" },
          { left: "плавання", right: "swimming" },
          { left: "танці", right: "dancing" },
          { left: "спів", right: "singing" },
        ],
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["I", "like", "watching", "movies", "in", "my", "free", "time"],
        options: ["I", "like", "watching", "movies", "in", "my", "free", "time"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "грати в футбол" англійською?',
        correctAnswer: "to play football",
        options: ["to play football", "to do football", "to make football", "to go football"],
      },
    ],
  },
  {
    title: "Подорожі",
    description: "Вивчіть слова та фрази, пов'язані з подорожами та туризмом.",
    icon: "✈️",
    difficulty: "advanced",
    category: "vocabulary",
    order: 13,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["travel", "tourism", "vacation", "sightseeing"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "паспорт" англійською?',
        correctAnswer: "passport",
        options: ["passport", "ticket", "visa", "luggage"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Я хочу забронювати номер у готелі"',
        correctAnswer: "I want to book a hotel room",
      },
      {
        type: "matching",
        question: "З'єднайте слова з їх перекладом",
        correctAnswer: [
          { left: "аеропорт", right: "airport" },
          { left: "вокзал", right: "station" },
          { left: "митниця", right: "customs" },
          { left: "валіза", right: "suitcase" },
        ],
        options: [
          { left: "аеропорт", right: "airport" },
          { left: "вокзал", right: "station" },
          { left: "митниця", right: "customs" },
          { left: "валіза", right: "suitcase" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Яке місце в літаку біля вікна?",
        correctAnswer: "Can I have a window seat",
        options: [
          "Can I have a window seat",
          "Can I have a window place",
          "Can I have a window spot",
          "Can I have a window position",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як запитати "Де туристичний інформаційний центр?" англійською?',
        correctAnswer: "Where is the tourist information centre?",
        options: [
          "Where is the tourist information centre?",
          "Where can I find information?",
          "Where is tourism office?",
          "Where to get tourist info?",
        ],
      },
    ],
  },
  {
    title: "Робота і професії",
    description: "Вивчіть назви професій та слова, пов'язані з роботою.",
    icon: "💼",
    difficulty: "advanced",
    category: "vocabulary",
    order: 14,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["work", "jobs", "professions", "career"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "вчитель" англійською?',
        correctAnswer: "teacher",
        options: ["teacher", "doctor", "engineer", "lawyer"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Я працюю програмістом"',
        correctAnswer: "I work as a programmer",
      },
      {
        type: "matching",
        question: "З'єднайте професії з їх перекладом",
        correctAnswer: [
          { left: "лікар", right: "doctor" },
          { left: "юрист", right: "lawyer" },
          { left: "медсестра", right: "nurse" },
          { left: "пожежник", right: "firefighter" },
        ],
        options: [
          { left: "лікар", right: "doctor" },
          { left: "юрист", right: "lawyer" },
          { left: "медсестра", right: "nurse" },
          { left: "пожежник", right: "firefighter" },
        ],
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["She", "has", "a", "job", "interview", "at", "a", "large", "company"],
        options: ["She", "has", "a", "job", "interview", "at", "a", "large", "company"],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "резюме" англійською (британський варіант)?',
        correctAnswer: "CV",
        options: ["CV", "resume", "bio", "profile"],
      },
    ],
  },
  {
    title: "Здоров'я",
    description: "Вивчіть слова та фрази, пов'язані зі здоров'ям та медициною.",
    icon: "🏥",
    difficulty: "advanced",
    category: "vocabulary",
    order: 15,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["health", "medicine", "body", "illness"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Як сказати "головний біль" англійською?',
        correctAnswer: "headache",
        options: ["headache", "toothache", "stomachache", "backache"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Мені потрібно записатися до лікаря"',
        correctAnswer: "I need to make an appointment with a doctor",
      },
      {
        type: "matching",
        question: "З'єднайте частини тіла з їх перекладом",
        correctAnswer: [
          { left: "серце", right: "heart" },
          { left: "легені", right: "lungs" },
          { left: "печінка", right: "liver" },
          { left: "нирки", right: "kidneys" },
        ],
        options: [
          { left: "серце", right: "heart" },
          { left: "легені", right: "lungs" },
          { left: "печінка", right: "liver" },
          { left: "нирки", right: "kidneys" },
        ],
      },
      {
        type: "sentence-completion",
        question: "Що приймають після їжі?",
        correctAnswer: "Take two pills with water after meals",
        options: [
          "Take two pills with water after meals",
          "Take two tablets with water after meals",
          "Take two medicine with water after meals",
          "Take two capsules with water after meals",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Як сказати "швидка допомога" англійською (британський варіант)?',
        correctAnswer: "ambulance",
        options: ["ambulance", "emergency", "first aid", "paramedic"],
      },
    ],
  },
  {
    title: "Граматика: Present Simple",
    description: "Вивчіть правила використання Present Simple та потренуйтеся у його застосуванні.",
    icon: "📝",
    difficulty: "intermediate",
    category: "grammar",
    order: 16,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["grammar", "tenses", "present simple"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Оберіть правильну форму дієслова: "She _____ coffee every morning."',
        correctAnswer: "drinks",
        options: ["drinks", "drink", "drinking", "is drinking"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Я не розмовляю французькою"',
        correctAnswer: "I don't speak French",
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["They", "usually", "go", "to", "bed", "at", "10", "pm"],
        options: ["They", "usually", "go", "to", "bed", "at", "10", "pm"],
      },
      {
        type: "sentence-completion",
        question: "Як часто ви граєте в теніс?",
        correctAnswer: "How often do you play tennis",
        options: [
          "How often do you play tennis",
          "How many times do you play tennis",
          "How much do you play tennis",
          "How frequently do you play tennis",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Оберіть правильну форму: "_____ she like chocolate?"',
        correctAnswer: "Does",
        options: ["Does", "Do", "Is", "Are"],
      },
    ],
  },
  {
    title: "Граматика: Past Simple",
    description: "Вивчіть правила використання Past Simple та потренуйтеся у його застосуванні.",
    icon: "📝",
    difficulty: "intermediate",
    category: "grammar",
    order: 17,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["grammar", "tenses", "past simple"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Оберіть правильну форму дієслова: "I _____ to the cinema last weekend."',
        correctAnswer: "went",
        options: ["went", "go", "going", "gone"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Вона не бачила цей фільм"',
        correctAnswer: "She didn't see this movie",
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["They", "visited", "their", "grandparents", "last", "summer"],
        options: ["They", "visited", "their", "grandparents", "last", "summer"],
      },
      {
        type: "sentence-completion",
        question: "Коли ви востаннє були в Лондоні?",
        correctAnswer: "When did you last visit London",
        options: [
          "When did you last visit London",
          "When were you last in London",
          "When have you last been to London",
          "When you visited London last time",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Оберіть правильну форму: "_____ they study English yesterday?"',
        correctAnswer: "Did",
        options: ["Did", "Do", "Were", "Have"],
      },
    ],
  },
  {
    title: "Граматика: Future Simple",
    description: "Вивчіть правила використання Future Simple та потренуйтеся у його застосуванні.",
    icon: "📝",
    difficulty: "intermediate",
    category: "grammar",
    order: 18,
    completed: false,
    completedCount: 0,
    isPublished: true,
    tags: ["grammar", "tenses", "future simple"],
    questions: [
      {
        type: "multiple-choice",
        question: 'Оберіть правильну форму дієслова: "I _____ you tomorrow."',
        correctAnswer: "will call",
        options: ["will call", "call", "calling", "am calling"],
      },
      {
        type: "translation",
        question: 'Перекладіть: "Вони не приїдуть на вечірку"',
        correctAnswer: "They won't come to the party",
      },
      {
        type: "word-order",
        question: "Складіть речення з наступних слів:",
        correctAnswer: ["She", "will", "graduate", "from", "university", "next", "year"],
        options: ["She", "will", "graduate", "from", "university", "next", "year"],
      },
      {
        type: "sentence-completion",
        question: "Ви поїдете у відпустку влітку?",
        correctAnswer: "Will you go on vacation in summer",
        options: [
          "Will you go on vacation in summer",
          "Are you going on vacation in summer",
          "Do you go on vacation in summer",
          "You will go on vacation in summer",
        ],
      },
      {
        type: "multiple-choice",
        question: 'Оберіть правильну форму: "_____ it rain tomorrow?"',
        correctAnswer: "Will",
        options: ["Will", "Is", "Does", "Has"],
      },
    ],
  },
]
