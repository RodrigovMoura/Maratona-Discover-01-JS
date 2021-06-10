const modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active') // classlist tras todas as classes existentes
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

//function toogleModal() {
//    const modalActive = document.querySelector('.modal-overlay')
//    modalActive.classList.toggle('active')
//}

const storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        app.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        app.reload()
    },
    incomes() {
        // Pegar todas as transaçãos - para cada uma delas, verificar se maior q 0, somar e retornar
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income

    },
    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}"> ${amount}</td>
        <td class="date"> ${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="/Maratona-discover/assets/minus.svg" alt="remover transação">
        </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "") // o D significa para pegar oq for não numerico - o G pega na string toda

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const form = {
    //verificar preenchimento - formatar os dados - salvar - refresh - fechar modal - atualizar

    description: document.querySelector('input#description'), // input que tenha o id description
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: form.description.value,
            amount: form.amount.value,
            date: form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = form.getValues()
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Todos os campos devem ser preenchidos.")
        }
    },

    formatValues() {
        let { description, amount, date } = form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, // retorna o objeto com o msm nome sem ter q repetir a palavra
            amount,
            date
        }
    },

    clearFields() {
        form.description.value = ""
        form.amount.value = ""
        form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            form.validateFields()
            const transaction = form.formatValues()
            Transaction.add(transaction)
            form.clearFields()
            modal.close()
        } catch (error) {
            alert(error.message)
        }


    }
}

const app = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        DOM.updateBalance()

        storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        app.init()
    }
}

app.init()

