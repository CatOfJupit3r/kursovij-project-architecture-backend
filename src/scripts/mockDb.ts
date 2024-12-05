/* eslint-disable @typescript-eslint/ban-ts-comment */
import CommentModel from '@models/CommentModel';
import PostModel from '@models/PostModel';
import UserModel from '@models/UserModel';
import bcrypt from 'bcrypt';
import mongoose, {Types} from 'mongoose';

// Helper function to generate random date
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Mock Data Generation
const mockUsers = [
    {
        userId: new Types.ObjectId(),
        createdAt: new Date(),
        profile: {
            handle: 'catofjupit3r',
            name: 'Roman Barmak',
            email: 'me@example.com',
            bio: 'Welcome to the demo account! Feel free to explore and interact with the platform.',
            following: [],
            saved: [],
            birthdate: new Date('1990-01-01'),
            avatar: 'https://example.com/avatar.jpg',
            cover: 'https://avatars.githubusercontent.com/u/113854186?v=4',
        },
        auth: {
            hashedPassword: bcrypt.hashSync('verystrong', 10),
            sessions: [],
        },
    },
    {
        userId: new Types.ObjectId(),
        createdAt: new Date(),
        profile: {
            handle: 'johndoe',
            name: 'John Doe',
            email: 'john.doe@example.com',
            bio: 'Software engineer and tech enthusiast',
            following: [],
            saved: [],
            birthdate: new Date('1990-05-15'),
            avatar: 'https://example.com/avatar1.jpg',
            cover: 'https://example.com/cover1.jpg',
        },
        auth: {
            hashedPassword: bcrypt.hashSync('password123', 10),
            sessions: [],
        },
    },
    {
        userId: new Types.ObjectId(),
        createdAt: new Date(),
        profile: {
            handle: 'janedoe',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            bio: 'Designer and creative professional',
            following: [],
            saved: [],
            birthdate: new Date('1992-08-22'),
            avatar: 'https://example.com/avatar2.jpg',
            cover: 'https://example.com/cover2.jpg',
        },
        auth: {
            hashedPassword: bcrypt.hashSync('securepass456', 10),
            sessions: [],
        },
    },
    {
        userId: new Types.ObjectId(),
        createdAt: new Date('2023-01-15T10:30:00Z'),
        profile: {
            handle: 'dev_explorer',
            name: 'Alex Rodriguez',
            email: 'alex.rodriguez@techstartup.com',
            bio: 'Full-stack developer | Open-source enthusiast | Building cool things',
            following: ['tech_guru', 'code_ninja'],
            saved: [],
            birthdate: new Date('1993-07-22'),
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            cover: 'https://images.unsplash.com/tech-landscape',
        },
        auth: {
            hashedPassword: bcrypt.hashSync('DevLife2023!', 10),
            sessions: [{ session_id: new Types.ObjectId().toString(), createdAt: new Date() }],
        },
    },
    {
        userId: new Types.ObjectId(),
        createdAt: new Date('2023-02-20T14:45:00Z'),
        profile: {
            handle: 'design_wizard',
            name: 'Emma Chen',
            email: 'emma.chen@creativestudio.com',
            bio: 'UX/UI Designer | Making digital experiences beautiful and intuitive',
            following: ['dev_explorer', 'startup_stories'],
            saved: [],
            birthdate: new Date('1995-11-10'),
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            cover: 'https://images.unsplash.com/design-workspace',
        },
        auth: {
            hashedPassword: bcrypt.hashSync('DesignRules2023!', 10),
            sessions: [{ session_id: new Types.ObjectId().toString(), createdAt: new Date() }],
        },
    },
    {
        userId: new Types.ObjectId(),
        createdAt: new Date('2023-03-05T09:15:00Z'),
        profile: {
            handle: 'ai_researcher',
            name: 'Dr. Sanjay Gupta',
            email: 'sanjay.gupta@ailab.edu',
            bio: 'Machine Learning Researcher | Neural Networks | Ethical AI Advocate',
            following: ['tech_innovations', 'data_science_daily'],
            saved: [],
            birthdate: new Date('1988-04-17'),
            avatar: 'https://randomuser.me/api/portraits/men/79.jpg',
            cover: 'https://images.unsplash.com/ai-research-lab',
        },
        auth: {
            hashedPassword: bcrypt.hashSync('MachineLearning2023!', 10),
            sessions: [{ session_id: new Types.ObjectId().toString(), createdAt: new Date() }],
        },
    },
];

const mockPosts = [
    {
        postId: new Types.ObjectId(),
        userId: mockUsers[0].userId,
        content: 'First post! Excited to be here!',
        likes: [],
        comments: [],
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
    {
        postId: new Types.ObjectId(),
        userId: mockUsers[1].userId,
        content: 'Hello world! This is my first post.',
        likes: [mockUsers[0].profile.handle],
        comments: [],
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
    {
        postId: new Types.ObjectId(),
        userId: mockUsers[0].userId,
        content: 'Just published my latest research on AI ethics. Check it out!',
        likes: [],
        comments: [],
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
    {
        postId: new Types.ObjectId(),
        userId: mockUsers[0].userId,
        content:
            'Just released my first open-source React component for dynamic form validation! Check it out on GitHub #OpenSource #WebDev',
        likes: ['design_wizard', 'ai_researcher'],
        comments: [],
        createdAt: new Date('2023-04-10T16:20:00Z'),
    },
    {
        postId: new Types.ObjectId(),
        userId: mockUsers[1].userId,
        content:
            'Exploring the intersection of design thinking and AI - how can we make technology more human-centered? 🤔 #UXDesign #AI',
        likes: ['dev_explorer', 'ai_researcher'],
        comments: [],
        createdAt: new Date('2023-04-15T11:45:00Z'),
    },
    {
        postId: new Types.ObjectId(),
        userId: mockUsers[2].userId,
        content:
            'Published a new research paper on ethical considerations in deep learning. Transparency and accountability are key! 📄🧠 #MachineLearning #EthicalAI',
        likes: ['design_wizard', 'dev_explorer'],
        comments: [],
        createdAt: new Date('2023-04-20T14:30:00Z'),
    },
];

const mockComments = [
    {
        commentId: new Types.ObjectId(),
        postId: mockPosts[1].postId,
        userId: mockUsers[0].userId,
        content: 'Great first post!',
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
    {
        commentId: new Types.ObjectId(),
        postId: mockPosts[0].postId,
        userId: mockUsers[1].userId,
        content: 'Amazing work! The form validation looks super clean and intuitive. 👏',
        createdAt: new Date('2023-04-11T09:15:00Z'),
    },
    {
        commentId: new Types.ObjectId(),
        postId: mockPosts[1].postId,
        userId: mockUsers[2].userId,
        content:
            "Love the perspective on human-centered AI. It's crucial we keep empathy at the forefront of technological innovation.",
        createdAt: new Date('2023-04-16T16:45:00Z'),
    },
    {
        commentId: new Types.ObjectId(),
        postId: mockPosts[2].postId,
        userId: mockUsers[0].userId,
        content: 'Excited to read your research! Ethical considerations are so important in our field.',
        createdAt: new Date('2023-04-21T10:30:00Z'),
    },
];

async function seedDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017', {
            // Add your connection options here
        });

        // Clear existing data
        await UserModel.deleteMany({});
        await PostModel.deleteMany({});
        await CommentModel.deleteMany({});

        for (const user of mockUsers) {
            const { following } = user.profile;
            // @ts-expect-error
            user.profile.following = mockUsers.filter((u) => following.includes(u.profile.handle)).map((u) => u.userId);
        }
        await UserModel.insertMany(mockUsers);
        for (const comment of mockComments) {
            const { postId } = comment;
            const post = mockPosts.find((p) => p.postId === postId);
            if (post) {
                // @ts-expect-error
                post.comments.push(comment.commentId as any);
            }
        }
        await PostModel.insertMany(mockPosts);
        await CommentModel.insertMany(mockComments);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
    }
}

// Run the seeding function
seedDatabase();

export { mockComments, mockPosts, mockUsers };
