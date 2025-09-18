const mongoose = require('mongoose');

// Simple demo data seeder using direct MongoDB connection
async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');

  try {
    // Connect to MongoDB (use your connection string)
    const MONGODB_URI = 'mongodb+srv://edviron_user:Jaynikam2@edviron-cluster.04dfzfx.mongodb.net/?retryWrites=true&w=majority&appName=edviron-cluster';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas
    const OrderSchema = new mongoose.Schema({
      school_id: String,
      trustee_id: String,
      custom_order_id: String,
      gateway_name: String,
      order_amount: Number,
      transaction_amount: Number,
      payment_mode: String,
      status: String,
      payment_time: Date,
    });

    const OrderStatusSchema = new mongoose.Schema({
      collect_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      order_amount: Number,
      transaction_amount: Number,
      payment_mode: String,
      payment_details: {
        transaction_id: String,
        gateway_response: String,
        metadata: {
          school_name: String,
          student_name: String,
          academic_year: String,
          fee_type: String
        }
      },
      status: String,
      processed_at: Date,
      gateway_order_id: String,
      gateway_payment_id: String,
      failure_reason: String,
      refund_amount: { type: Number, default: 0 },
      created_at: Date,
      updated_at: Date,
    });

    const Order = mongoose.model('Order', OrderSchema);
    const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);

    // Clear existing demo data
    await Order.deleteMany({});
    await OrderStatus.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Sample data
    const schools = [
      { name: 'Delhi Public School', id: 'DPS001' },
      { name: 'Kendriya Vidyalaya', id: 'KV002' },
      { name: 'DAV Public School', id: 'DAV003' },
      { name: 'Ryan International', id: 'RYAN004' },
      { name: 'Modern School', id: 'MOD005' },
      { name: 'Bal Bharati School', id: 'BB006' },
    ];

    const students = [
      'Rahul Sharma', 'Priya Patel', 'Arjun Kumar', 'Sneha Gupta',
      'Vikram Singh', 'Ananya Reddy', 'Karan Mehta', 'Isha Verma',
      'Aditya Joshi', 'Kavya Nair', 'Rohit Agarwal', 'Neha Mishra',
    ];

    const paymentModes = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'];
    const statuses = ['success', 'pending', 'failed'];
    const amounts = [500, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000];

    // Generate and insert orders
    console.log('📦 Creating demo orders...');
    const orders = [];

    for (let i = 0; i < 80; i++) {
      const school = schools[Math.floor(Math.random() * schools.length)];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      
      const now = new Date();
      const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const order = {
        school_id: school.id,
        trustee_id: 'TRUSTEE_001',
        custom_order_id: `ORD${String(i + 1).padStart(6, '0')}`,
        gateway_name: 'Edviron Gateway',
        order_amount: amount,
        transaction_amount: status === 'failed' ? 0 : amount,
        payment_mode: paymentMode,
        status: status,
        payment_time: pastDate,
      };

      orders.push(order);
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} demo orders`);

    // Create order statuses
    console.log('📊 Creating order statuses...');
    const orderStatuses = [];
    
    for (let i = 0; i < createdOrders.length; i++) {
      const order = orders[i];
      const createdOrder = createdOrders[i];
      const student = students[i % students.length];
      const school = schools.find(s => s.id === order.school_id);
      
      let gatewayResponse;
      if (order.status === 'success') {
        gatewayResponse = 'Payment successful';
      } else if (order.status === 'pending') {
        gatewayResponse = 'Payment pending';
      } else {
        gatewayResponse = 'Payment failed';
      }

      const feeTypes = ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Lab Fee'];
      const failureReasons = ['Insufficient funds', 'Card declined', 'Network timeout', 'Invalid CVV'];
      
      const orderStatus = {
        collect_id: createdOrder._id,
        order_amount: order.order_amount,
        transaction_amount: order.transaction_amount,
        payment_mode: order.payment_mode,
        payment_details: {
          transaction_id: `TXN${String(i + 1).padStart(8, '0')}`,
          gateway_response: gatewayResponse,
          metadata: {
            school_name: school ? school.name : 'Unknown School',
            student_name: student,
            academic_year: '2024-25',
            fee_type: feeTypes[Math.floor(Math.random() * feeTypes.length)]
          }
        },
        status: order.status,
        processed_at: order.payment_time,
        gateway_order_id: `GATEWAY_${String(i + 1).padStart(8, '0')}`,
        gateway_payment_id: order.status !== 'pending' ? `PAY_${String(i + 1).padStart(8, '0')}` : null,
        failure_reason: order.status === 'failed' ? 
          failureReasons[Math.floor(Math.random() * failureReasons.length)] : null,
        refund_amount: order.status === 'failed' && Math.random() > 0.7 ? order.order_amount : 0,
        created_at: order.payment_time,
        updated_at: order.payment_time,
      };

      orderStatuses.push(orderStatus);
    }

    const createdStatuses = await OrderStatus.insertMany(orderStatuses);
    console.log(`✅ Created ${createdStatuses.length} order statuses`);

    // Generate summary
    const totalTransactions = orders.length;
    const successfulPayments = orders.filter(o => o.status === 'success').length;
    const pendingPayments = orders.filter(o => o.status === 'pending').length;
    const failedPayments = orders.filter(o => o.status === 'failed').length;
    const totalRevenue = orders.filter(o => o.status === 'success').reduce((sum, o) => sum + o.transaction_amount, 0);
    const successRate = ((successfulPayments / totalTransactions) * 100).toFixed(1);

    console.log('\n📈 Demo Data Summary:');
    console.log(`   Total Transactions: ${totalTransactions}`);
    console.log(`   Successful Payments: ${successfulPayments}`);
    console.log(`   Pending Payments: ${pendingPayments}`);
    console.log(`   Failed Payments: ${failedPayments}`);
    console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Schools: ${schools.length}`);
    console.log(`   Students: ${students.length}`);

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Demo data seeding completed successfully!');
  console.log('You can now login with: admin@edviron.com / admin123');
  console.log('The dashboard will now show realistic transaction data!');
}

seedDemoData().catch(console.error);