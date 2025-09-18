import mongoose from 'mongoose';

// Helper functions to reduce cognitive complexity
function getGatewayResponse(status) {
  switch (status) {
    case 'success': return 'Payment successful';
    case 'pending': return 'Payment pending';
    default: return 'Payment failed';
  }
}

function createOrderStatus(order, createdOrder, student, school, i) {
  const feeTypes = [
    'Tuition Fee',
    'Transport Fee',
    'Library Fee',
    'Lab Fee',
  ];
  const failureReasons = [
    'Insufficient funds',
    'Card declined',
    'Network timeout',
    'Invalid CVV',
  ];

  return {
    collect_id: createdOrder._id,
    order_amount: order.order_amount,
    transaction_amount: order.transaction_amount,
    payment_mode: order.payment_mode,
    payment_details: {
      transaction_id: `TXN${String(i + 1).padStart(8, '0')}`,
      gateway_response: getGatewayResponse(order.status),
      metadata: {
        school_name: school ? school.name : 'Unknown School',
        student_name: student,
        academic_year: '2024-25',
        fee_type: feeTypes[Math.floor(Math.random() * feeTypes.length)],
      },
    },
    status: order.status,
    processed_at: order.payment_time,
    gateway_order_id: `GATEWAY_${String(i + 1).padStart(8, '0')}`,
    gateway_payment_id:
      order.status !== 'pending'
        ? `PAY_${String(i + 1).padStart(8, '0')}`
        : null,
    failure_reason:
      order.status === 'failed'
        ? failureReasons[Math.floor(Math.random() * failureReasons.length)]
        : null,
    refund_amount:
      order.status === 'failed' && Math.random() > 0.7
        ? order.order_amount
        : 0,
    created_at: order.payment_time,
    updated_at: order.payment_time,
  };
}

async function generateOrders(demoUserId) {
  const schools = [
    { name: 'Delhi Public School', id: 'DPS001' },
    { name: 'Kendriya Vidyalaya', id: 'KV002' },
    { name: 'DAV Public School', id: 'DAV003' },
    { name: 'Ryan International', id: 'RYAN004' },
    { name: 'Modern School', id: 'MOD005' },
    { name: 'Bal Bharati School', id: 'BB006' },
  ];

  const students = [
    'Rahul Sharma',
    'Priya Patel',
    'Arjun Kumar',
    'Sneha Gupta',
    'Vikram Singh',
    'Ananya Reddy',
    'Karan Mehta',
    'Isha Verma',
    'Aditya Joshi',
    'Kavya Nair',
    'Rohit Agarwal',
    'Neha Mishra',
  ];

  const orders = [];

  for (let i = 0; i < 80; i++) {
    const school = schools[Math.floor(Math.random() * schools.length)];
    const student = students[i % students.length];

    // Create order record (matching new schema)
    const order = {
      school_id: school.id,
      trustee_id: 'TRUSTEE_001',
      custom_order_id: `ORD${String(i + 1).padStart(6, '0')}`,
      gateway_name: 'edviron',
      student_info: {
        name: student,
        id: `STU${String(i + 1).padStart(6, '0')}`,
        email: `${student.toLowerCase().replace(' ', '.')}@school.edu`,
        class: `Class ${Math.floor(Math.random() * 12) + 1}`,
        section: String.fromCharCode(65 + Math.floor(Math.random() * 4)) // A, B, C, D
      },
      created_by: demoUserId, // Associate with demo user
    };

    orders.push(order);
  }

  return { orders, schools, students };
}

// Simple demo data seeder using direct MongoDB connection
async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');

  try {
    // Connect to MongoDB - use the same URI as the demo user script
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://edviron_user:Jaynikam2@edviron-cluster.04dfzfx.mongodb.net/?retryWrites=true&w=majority&appName=edviron-cluster';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // First, verify the demo user exists
    const UserSchema = new mongoose.Schema({
      email: String,
      username: String,
      _id: mongoose.Schema.Types.ObjectId
    });
    const User = mongoose.model('User', UserSchema);
    
    const demoUser = await User.findOne({ email: 'admin@edviron.com' });
    if (!demoUser) {
      console.log('❌ Demo user not found! Please run create-demo-user.js first.');
      return;
    }
    console.log('✅ Found demo user:', demoUser.email);

    // Define schemas with proper structure matching the application
    const OrderSchema = new mongoose.Schema({
      school_id: String,
      trustee_id: String,
      custom_order_id: { type: String, unique: true },
      gateway_name: String,
      student_info: {
        name: String,
        id: String,
        email: String,
        class: String,
        section: String
      },
      created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Associate with demo user
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { timestamps: true });

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
          fee_type: String,
        },
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

    // Clear existing demo data (only for demo user)
    await Order.deleteMany({ created_by: demoUser._id });
    await OrderStatus.deleteMany({});
    console.log('🗑️ Cleared existing demo data for demo user');

    const students = [
      'Rahul Sharma',
      'Priya Patel',
      'Arjun Kumar',
      'Sneha Gupta',
      'Vikram Singh',
      'Ananya Reddy',
      'Karan Mehta',
      'Isha Verma',
      'Aditya Joshi',
      'Kavya Nair',
      'Rohit Agarwal',
      'Neha Mishra',
    ];

    // Generate and insert orders
    console.log('📦 Creating demo orders...');
    const { orders, schools } = await generateOrders(demoUser._id);

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} demo orders`);

    // Create order statuses
    console.log('📊 Creating order statuses...');
    const orderStatuses = [];

    for (let i = 0; i < createdOrders.length; i++) {
      const order = orders[i];
      const createdOrder = createdOrders[i];
      const student = students[i % students.length];
      const school = schools.find((s) => s.id === order.school_id);

      const orderStatus = createOrderStatus(order, createdOrder, student, school, i);
      orderStatuses.push(orderStatus);
    }

    const createdStatuses = await OrderStatus.insertMany(orderStatuses);
    console.log(`✅ Created ${createdStatuses.length} order statuses`);

    // Generate summary
    const totalTransactions = orders.length;
    const successfulPayments = orders.filter(
      (o) => o.status === 'success',
    ).length;
    const pendingPayments = orders.filter((o) => o.status === 'pending').length;
    const failedPayments = orders.filter((o) => o.status === 'failed').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'success')
      .reduce((sum, o) => sum + o.transaction_amount, 0);
    const successRate = (
      (successfulPayments / totalTransactions) *
      100
    ).toFixed(1);

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