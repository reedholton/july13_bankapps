//Made by Reed Holton
import java.util.*;

//Admin credentials: admin, admin123
//User credentials: .....................

public class Runner {
    static Scanner sc = new Scanner(System.in);

    static List<User> users = new ArrayList<>();
    static Bank bank = new Bank(1, "ABC Digital Bank", new ArrayList<>()); // added: central object to hold customers + their accounts

    static {
        User admin = new Admin();
        admin.setUsername("admin");
        admin.setPassword("admin123");

        User customer1 = new Customer();
        customer1.setUsername("rohit");
        customer1.setPassword("rohit123");

        User customer2 = new Customer();
        customer2.setUsername("mohit");
        customer2.setPassword("mohit123");

        User customer3 = new Customer();
        customer3.setUsername("shobhit");
        customer3.setPassword("shobhit123");

        users.add(admin);
        users.add(customer1); users.add(customer2); users.add(customer3);

        for (User u : users) {
            if (u instanceof Customer) {
                Customer c = (Customer) u;
                bank.addCustomer(c);
                bank.openAccount(c, "checking", 100.0);
            }
        }
    }


    public static void main(String[] args) {
        printMessage("Welcome to " + bank.getName()); // changed: pulls the name from the Bank object instead of a hardcoded string

        boolean flag = true;
        while (flag) {
            String loginResult = login();

            if (loginResult.equals("invalid")) {
                printMessage("Invalid Credentials"); // changed: routed through printMessage() instead of calling System.out.println directly, for consistency
            } else if (loginResult.equals("admin")) {
                adminDashboard(loginResult); // implemented: was an empty TODO stub in the scaffold
            } else {
                customerDashboard(loginResult); // implemented: was an empty TODO stub in the scaffold
            }

            printMessage("Do you want to continue? Press y/n");
            String mainLoopUserResponse = sc.nextLine();
            if (mainLoopUserResponse.equalsIgnoreCase("n")) {
                flag = false;
            }
        }

        printMessage("Thank you for banking with " + bank.getName() + ". Goodbye!");
    }

    private static void customerDashboard(String username) { // implemented: original scaffold only had a TODO here
        Customer customer = bank.findCustomerByUsername(username); // look up the full Customer object (with accounts) using the login username
        if (customer == null) {
            printMessage("No customer record found for " + username + ".");
            return;
        }

        printMessage("Welcome customer, " + username);

        boolean loggedIn = true;
        while (loggedIn) { // menu loop keeps the user in the dashboard until they choose Logout
            printMessage("\n----- Customer Menu -----");
            printMessage("1. View my accounts");
            printMessage("2. Deposit");
            printMessage("3. Withdraw");
            printMessage("4. Transfer");
            printMessage("5. Open a new account");
            printMessage("6. Logout");
            int choice = readInt("Choose an option: ");

            switch (choice) { // switch-case menu the scaffold's TODO asked for
                case 1:
                    printAccounts(customer.getAccounts());
                    break;
                case 2: { // deposit flow
                    Account acc = selectAccount(customer);
                    if (acc == null) break;
                    double amount = readDouble("Amount to deposit: $");
                    if (acc.deposit(amount)) {
                        System.out.printf("Deposited $%.2f. New balance: $%.2f%n", amount, acc.getBalance());
                    } else {
                        printMessage("Deposit amount must be positive."); // deposit() rejects amounts <= 0
                    }
                    break;
                }
                case 3: { // withdraw flow
                    Account acc = selectAccount(customer);
                    if (acc == null) break;
                    double amount = readDouble("Amount to withdraw: $");
                    if (acc.withdraw(amount)) {
                        System.out.printf("Withdrew $%.2f. New balance: $%.2f%n", amount, acc.getBalance());
                    } else {
                        printMessage("Withdrawal failed - check amount and available balance."); // withdraw() blocks overdrafts (and savings has its own min-balance rule)
                    }
                    break;
                }
                case 4: { // transfer flow - can move money to any account in the bank, not just the customer's own
                    printMessage("Transfer FROM:");
                    Account from = selectAccount(customer);
                    if (from == null) break;

                    Account to = findTransferTarget(customer, from);
                    if (to == null) break;

                    double amount = readDouble("Amount to transfer: $");
                    if (from.transfer(amount, to)) {
                        System.out.printf("Transferred $%.2f from account #%d to account #%d.%n",
                                amount, from.getId(), to.getId());
                    } else {
                        printMessage("Transfer failed - check amount and available balance.");
                    }
                    break;
                }
                case 5: { // lets the customer self-serve opening a new account
                    String type = readAccountType();
                    Account newAcc = bank.openAccount(customer, type, 0.0);
                    printMessage("Opened new " + newAcc.getAccountType() + " account, #" + newAcc.getId());
                    break;
                }
                case 6:
                    printMessage("Logging out...");
                    loggedIn = false;
                    break;
                default:
                    printMessage("Please choose a valid option (1-6).");
            }
        }
    }

    private static Account selectAccount(Customer customer) { // helper: has the customer pick one of their own accounts by id
        List<Account> accounts = customer.getAccounts();
        if (accounts.isEmpty()) {
            printMessage("You have no accounts yet.");
            return null;
        }
        printAccounts(accounts);
        int id = readInt("Enter the account number: ");
        for (Account a : accounts) {
            if (a.getId() == id) return a;
        }
        printMessage("No account with that number.");
        return null;
    }

    private static Account findTransferTarget(Customer customer, Account from) { // looks up any account bank-wide, so transfers can go to other customers too
        printMessage("Transfer TO which account number? (can be your own or another customer's)");
        int id = readInt("Enter the account number: ");
        Account to = bank.findAccountById(id);
        if (to == null) {
            printMessage("No account with that number.");
            return null;
        }
        if (to.getId() == from.getId()) {
            printMessage("You can't transfer an account to itself."); // guards against a pointless self-transfer
            return null;
        }
        return to;
    }

    private static void printAccounts(List<Account> accounts) { // shared table-print helper used by both the customer and admin views
        if (accounts.isEmpty()) {
            printMessage("(no accounts)");
            return;
        }
        printMessage("Acct # | Type       | Balance   | Interest Rate");
        for (Account a : accounts) {
            System.out.printf("%-7d| %-11s| $%-9.2f| %.1f%%%n", // printf so the columns line up, unlike plain println
                    a.getId(), a.getAccountType(), a.getBalance(), a.getInterestRate() * 100);
        }
    }

    private static String readAccountType() { // shared by "customer opens own account" and "admin opens account for customer"
        while (true) {
            printMessage("Account type - 1) Checking  2) Savings");
            int t = readInt("Choose: ");
            if (t == 1) return "checking";
            if (t == 2) return "savings";
            printMessage("Please choose 1 or 2.");
        }
    }

    private static void adminDashboard(String loginResult) { // implemented: original scaffold only had a TODO here
        printMessage("Welcome admin");

        boolean loggedIn = true;
        while (loggedIn) {
            printMessage("\n----- Admin Menu -----");
            printMessage("1. View all customers");
            printMessage("2. View all accounts");
            printMessage("3. Add a new customer");
            printMessage("4. Remove a customer");
            printMessage("5. Open an account for a customer");
            printMessage("6. Logout");
            int choice = readInt("Choose an option: ");

            switch (choice) { // basic CRUD for customers/accounts, as the scaffold's TODO asked for
                case 1:
                    printCustomers(bank.getCustomers());
                    break;
                case 2:
                    printAccounts(bank.getAllAccounts()); // reuses the same table helper as the customer dashboard
                    break;
                case 3: { // create customer
                    System.out.print("New username: ");
                    String uname = sc.nextLine().trim();
                    System.out.print("New password: ");
                    String pwd = sc.nextLine().trim();

                    if (uname.isEmpty() || pwd.isEmpty()) {
                        printMessage("Username/password can't be blank.");
                        break;
                    }
                    if (bank.findCustomerByUsername(uname) != null) {
                        printMessage("That username is already taken."); // prevents a duplicate username from breaking login lookup later
                        break;
                    }

                    Customer c = new Customer();
                    c.setUsername(uname);
                    c.setPassword(pwd);
                    users.add(c); // still needed so login() (which checks the users list) can authenticate this customer
                    bank.addCustomer(c);
                    printMessage("Customer '" + uname + "' created.");
                    break;
                }
                case 4: { // delete customer
                    System.out.print("Username to remove: ");
                    String uname = sc.nextLine().trim();
                    Customer c = bank.findCustomerByUsername(uname);
                    if (c == null) {
                        printMessage("No such customer.");
                    } else {
                        bank.removeCustomer(c);
                        users.remove(c); // remove from both lists so they can no longer log in
                        printMessage("Customer '" + uname + "' removed.");
                    }
                    break;
                }
                case 5: { // admin opens an account on a customer's behalf
                    System.out.print("Username to open an account for: ");
                    String uname = sc.nextLine().trim();
                    Customer c = bank.findCustomerByUsername(uname);
                    if (c == null) {
                        printMessage("No such customer.");
                        break;
                    }
                    String type = readAccountType();
                    double opening = readDouble("Opening deposit: $");
                    Account acc = bank.openAccount(c, type, Math.max(opening, 0)); // Math.max guards against a negative opening deposit typo
                    printMessage("Opened " + acc.getAccountType() + " account #" + acc.getId()
                            + " for " + uname + ".");
                    break;
                }
                case 6:
                    printMessage("Logging out...");
                    loggedIn = false;
                    break;
                default:
                    printMessage("Please choose a valid option (1-6).");
            }
        }
    }

    private static void printCustomers(List<Customer> customers) { // admin-only view: lists every customer and how many accounts they hold
        if (customers.isEmpty()) {
            printMessage("(no customers)");
            return;
        }
        for (Customer c : customers) {
            System.out.printf("- %s  (%d account%s)%n",
                    c.getUsername(), c.getAccounts().size(), c.getAccounts().size() == 1 ? "" : "s"); // ternary just handles the "1 account" vs "2 accounts" wording
        }
    }

    static String login() {
        String loginType = "invalid";
        printMessage("Please enter your username and password separated by a space");
        String enteredUsernamePassword = sc.nextLine();
        String[] parts = enteredUsernamePassword.trim().split("\\s+"); //trim() + split("\\s+") make the input parsing forgiving of accidental extra spaces

        if (parts.length < 2) {
            return loginType; // fix: original code indexed parts[1] directly, which crashed on single-word input
        }
        String enteredUsername = parts[0];
        String enteredPassword = parts[1];

        if (enteredUsername.equals("admin") && enteredPassword.equals("admin123")) {
            loginType = "admin";
        } else {
            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                if (enteredUsername.equals(user.getUsername()) && enteredPassword.equals(user.getPassword())) {
                    loginType = user.getUsername();
                    break;
                }
            }
        }

        return loginType;
    }

    static void printMessage(String message) {
        System.out.println(message);
    }

    private static int readInt(String prompt) { // added: wraps Scanner so non-numeric menu input re-prompts instead of crashing
        while (true) {
            System.out.print(prompt);
            String line = sc.nextLine().trim();
            try {
                return Integer.parseInt(line);
            } catch (NumberFormatException e) {
                printMessage("Please enter a whole number.");
            }
        }
    }

    private static double readDouble(String prompt) { // added: same idea as readInt but for dollar amounts
        while (true) {
            System.out.print(prompt);
            String line = sc.nextLine().trim();
            try {
                return Double.parseDouble(line);
            } catch (NumberFormatException e) {
                printMessage("Please enter a number.");
            }
        }
    }
}


class Bank {
    private int id;
    private String name;
    private List<Customer> customers = new ArrayList<>();

    public Bank(int id, String name, List<Customer> customers) {
        this.id = id;
        this.name = name;
        this.customers = customers;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Customer> getCustomers() {
        return customers;
    }

    public void setCustomers(List<Customer> customers) {
        this.customers = customers;
    }

    public void addCustomer(Customer c) { // added: registers a customer so admin/login lookups can find them
        customers.add(c);
    }

    public void removeCustomer(Customer c) { // added
        customers.remove(c);
    }

    public Customer findCustomerByUsername(String username) { // added: used by both the dashboards and the admin CRUD options
        for (Customer c : customers) {
            if (c.getUsername().equals(username)) return c;
        }
        return null;
    }

    public Account openAccount(Customer owner, String type, double openingBalance) { // added: factory method that decides which Account subclass to build
        Account account;
        if ("savings".equalsIgnoreCase(type)) {
            account = new SavingsAccount();
        } else {
            account = new CheckingAccount();
        }
        account.setOwner(owner);
        if (openingBalance > 0) {
            account.deposit(openingBalance); // reuse deposit() rather than setting the balance directly, so its validation still applies
        }
        owner.addAccount(account);
        return account;
    }

    public List<Account> getAllAccounts() { // added: flattens every customer's accounts into one list, for the admin "view all accounts" option
        List<Account> all = new ArrayList<>();
        for (Customer c : customers) {
            all.addAll(c.getAccounts());
        }
        return all;
    }

    public Account findAccountById(int id) { // added: lets a transfer target any account bank-wide, not just the sender's own
        for (Account a : getAllAccounts()) {
            if (a.getId() == id) return a;
        }
        return null;
    }
}

abstract class User {
    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    abstract String getUserType();
}


class Admin extends User{
    String getUserType() {
        return "admin";
    }
}

class Customer extends User {
    private List<Account> accounts = new ArrayList<>(); // added: each customer now actually owns a list of accounts

    String getUserType() {
        return "customer";
    }

    public List<Account> getAccounts() {
        return accounts;
    }

    public void addAccount(Account account) { // added: called by Bank.openAccount() whenever a new account is created
        accounts.add(account);
    }
}


abstract class Account implements AccountOperations { // filled in the id/balance fields the scaffold had only as comments
    private static int nextId = 1001; // added: shared counter so every new account gets a unique id automatically

    private int id;
    private double balance;
    private Customer owner; // added: back-reference so an account knows who it belongs to

    public Account() { // added constructor: auto-assigns the id and starts the balance at 0
        this.id = nextId++;
        this.balance = 0.0;
    }

    public int getId() {
        return id;
    }

    public double getBalance() {
        return balance;
    }

    protected void setBalance(double balance) { // protected: lets subclasses like SavingsAccount adjust balance with their own rules
        this.balance = balance;
    }

    public Customer getOwner() {
        return owner;
    }

    public void setOwner(Customer owner) {
        this.owner = owner;
    }

    public abstract String getAccountType();

    public abstract double getInterestRate(); // added: each subclass reports its own rate (1% checking, 2% savings)

    @Override
    public boolean deposit(double amount) { // implemented: was an empty method body in the scaffold
        if (amount <= 0) return false; // reject zero/negative deposits instead of corrupting the balance
        balance += amount;
        return true;
    }

    @Override
    public boolean withdraw(double amount) { // implemented: was an empty method body in the scaffold
        if (amount <= 0 || amount > balance) return false; // blocks overdrafts
        balance -= amount;
        return true;
    }

    @Override
    public boolean transfer(double amount, Account destination) { // implemented: also changed the signature to take an amount + destination account
        if (destination == null || amount <= 0 || amount > balance) return false;
        // withdraw() re-checks the amount, but we already know it's valid here.
        this.withdraw(amount);
        destination.deposit(amount); // a transfer is just a withdraw from this account plus a deposit into the other
        return true;
    }
}

class CheckingAccount extends Account { // implemented: was an empty class with three no-op override methods in the scaffold
    private static final double INTEREST_RATE = 0.01; // 1% - matches the scaffold's "getInterestRate() // 1%" comment

    @Override
    public String getAccountType() {
        return "Checking";
    }

    @Override
    public double getInterestRate() {
        return INTEREST_RATE;
    }
}

class SavingsAccount extends Account { // implemented: was an empty class with three no-op override methods in the scaffold
    private static final double INTEREST_RATE = 0.02; // 2% - matches the scaffold's "getInterestRate() // 2%" comment
    private static final double MIN_BALANCE = 50.0; // added: savings-specific rule not in the original scaffold

    @Override
    public String getAccountType() {
        return "Savings";
    }

    @Override
    public double getInterestRate() {
        return INTEREST_RATE;
    }

    // Savings accounts enforce a minimum balance, so they override withdraw()
    // rather than relying purely on the base-class version.
    @Override
    public boolean withdraw(double amount) {
        if (amount <= 0) return false;
        if (getBalance() - amount < MIN_BALANCE) return false;
        setBalance(getBalance() - amount);
        return true;
    }
}

interface AccountOperations { // changed: gave each method real parameters + a boolean return instead of the scaffold's empty void methods
    boolean deposit(double amount);
    boolean withdraw(double amount);
    boolean transfer(double amount, Account destination);
}