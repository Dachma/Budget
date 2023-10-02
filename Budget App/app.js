let budgetController = (function() {

  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalInc) {
    if(totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let data = {
    allItems: {
      expenses: [],
      income: []
    },
    totals: {
      expenses: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  let calculateTotal = function(type) {
    let sum = 0;
      data.allItems[type].forEach(function(curr) {
        sum += curr.value;
      });
    data.totals[type] = sum;
  }

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      // determine ID
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // add an item in the data
      if(type === 'expenses') {
        newItem = new Expense(ID, des, val);
      } else if(type === 'income') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    //delete item
    deleteItem: function(type, id) {
      let ids;
      ids = data.allItems[type].map(curr => {
        return curr.id;
      });
      index = ids.indexOf(id);
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function(type) {
      // calculate totals
      calculateTotal('income');
      calculateTotal('expenses');

      // calculate budget
      data.budget = data.totals.income - data.totals.expenses;

      // calculate percentage
      if(data.totals.income !== 0) {
        data.percentage = Math.round((data.totals.expenses / data.totals.income) * 100);
      }
    },

    calculatePercentages: function() {
      data.allItems.expenses.forEach((cur) => {
        cur.calcPercentage(data.totals.income);
      });
    },

    getPercentage: function() {
      let percs = data.allItems.expenses.map((cur) => {
        return cur.getPercentage();
      });
      return percs;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.income,
        totalExpenses: data.totals.expenses,
        percentage: data.percentage
      }
    }
  }
})();


let UIController = (function() {

  let DOMstrings = {
    addBtn: '.add__btn',
    addType: '.add__type',
    addDescription: '.add__description',
    addValue: '.add__value',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetValue: '.budget__value',
    incomeValue: '.budget__income--value',
    expensesValue: '.budget__expenses--value',
    percentage: '.budget__expenses--percentage',
    container: '.container',
    exppercentages: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  let nodeForEach = function(list, callback) {
    for(let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  let formatNumber = function(num, type) {
    let splitNum, int, dec;

    num = Math.abs(num).toFixed(2);
    splitNum = num.split('.');
    int = splitNum[0];
    dec = splitNum[1];
    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    return (type === 'expenses' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  return {
    getDOMstrings: function() {
      return DOMstrings;
    },

    addToUI: function(obj, type) {
      let html, element, newHtml;

      if (type === 'income'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'expenses'){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="expenses-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // replace html with objects properties
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // add html to the html file
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteFromUI: function(id) {
      let e = document.getElementById(id);
      e.parentNode.removeChild(e);
    },

    clearFields: function() {
      let fields, fieldsArray;
      fields = document.querySelectorAll(DOMstrings.addDescription + ', ' + DOMstrings.addValue);
      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(item => {
        item.value = '';
      });
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? type = 'income' : type = 'expenses';

      document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.totalIncome, 'income');
      document.querySelector(DOMstrings.expensesValue).textContent = formatNumber(obj.totalExpenses, 'expenses');
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentage).textContent = `${obj.percentage}%`; 
      } else {
        document.querySelector(DOMstrings.percentage).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      let fields = document.querySelectorAll(DOMstrings.exppercentages);

      nodeForEach(fields, function(cur, index) {
        if(percentages[index] > 0) {
          cur.textContent = `${percentages[index]}%`;
        } else {
          cur.textContent = '---';
        }
      });
    },

    toggleClass: function() {
      let fields = document.querySelectorAll(
        DOMstrings.addDescription + ',' +
        DOMstrings.addValue + ',' +
        DOMstrings.addType);

      nodeForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.addBtn).classList.toggle('red');
    },

    displayDate: function() {
      let now, month, year, arr;

      arr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      return document.querySelector(DOMstrings.dateLabel).textContent = `${arr[month]} ${year}`;
    },
    
    getInputValues: function() {
      return {
        type: document.querySelector(DOMstrings.addType).value,
        description: document.querySelector(DOMstrings.addDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.addValue).value)
      }
    },
  }
})();


let controller = (function(budgetCtrl, UICtrl) {

  let setEventListeners = function() {
    let DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(e) {
      if(e.key === 'Enter') {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.addType).addEventListener('change', UICtrl.toggleClass);
  }

  let updateBudget = function() {
    // calculate budget
    budgetCtrl.calculateBudget();

    // return budget
    let budget = budgetCtrl.getBudget();

    // update budget UI
    UICtrl.displayBudget(budget);
  };

  let updatePercentages = function() {
    // calculate percentages
    budgetCtrl.calculatePercentages();

    // store percentages
    let percentages = budgetCtrl.getPercentage();

    // display percentages
    UICtrl.displayPercentages(percentages);
  }

  let ctrlAddItem = function() {
    let inputs, newItem;
    // get input data
    inputs = UICtrl.getInputValues();

    if(inputs.description !== "" && inputs.value > 0) {
      // add item to Budget Controller
      newItem = budgetCtrl.addItem(inputs.type, inputs.description, inputs.value);

      // add it to the UI
      UICtrl.addToUI(newItem, inputs.type);

      // clear fields
      UICtrl.clearFields();

      // update budget
      updateBudget();

      // update percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = function(event) {
    let parentID, splitted, type, ID;

    parentID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(parentID) {
      splitted = parentID.split('-');
      type = splitted[0];
      ID = parseInt(splitted[1]);
    }
    
    // delete item from data
    budgetCtrl.deleteItem(type, ID);

    // delete item from UI
    UICtrl.deleteFromUI(parentID);

    // re-calculate budget
    updateBudget();

    // update percentages
    updatePercentages();
  };

  return {
    init: function() {
      setEventListeners();
      UICtrl.displayDate();
    }
  }

})(budgetController, UIController); 

controller.init();