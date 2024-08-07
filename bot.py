import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
import pocketbase
from datetime import datetime


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
API_TOKEN = "6002868869:AAHNrCvT49rsU7kOWfqypgwtxKR6vR9d-Ic"

# PocketBase configuration
POCKETBASE_URL = "http://localhost:8090"  # Replace with your PocketBase URL

# Initialize bot and dispatcher
bot = Bot(token=API_TOKEN)

dp = Dispatcher()

# Initialize PocketBase client
pb = pocketbase.Client(POCKETBASE_URL)

# Define states for the conversation
class TaskStates(StatesGroup):
    TITLE = State()
    DESCRIPTION = State()
    PRICE = State()
    CONTRACT = State()
def authenticate_pocketbase():
    try:
        if not pb.auth_store.token:
            pb.collection('users').auth_with_password("anton96vice@gmail.com", "AaV1488neon96!")
            logger.info("Authenticated with PocketBase")
        else:
            logger.info("Already authenticated with PocketBase")
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise

# Make sure to call this function before any PocketBase operations
# For example, in the contracts_command function:

        
@dp.message(Command("start"))
async def start_command(message: types.Message):
    logger.info(f"Received /start command from user {message.from_user.id}")
    await message.reply("Welcome to the Task Management Bot! Use /add_task to add a new task, /contracts to view available contracts, or /chatid to see the current chat ID.")

@dp.message(Command("chatid"))
async def chatid_command(message: types.Message):
    logger.info(f"Received /chatid command from user {message.from_user.id}")
    chat_id = message.chat.id
    chat_type = message.chat.type
    await message.reply(f"Current Chat ID: {chat_id}\nChat Type: {chat_type}")


@dp.message(Command("add_task"))
async def add_task_command(message: types.Message, state: FSMContext):
    logger.info(f"Received /add_task command from user {message.from_user.id}")
    await state.set_state(TaskStates.TITLE)
    await message.reply("Let's add a new task. Please enter the task title:")

@dp.message(TaskStates.TITLE)
async def process_title(message: types.Message, state: FSMContext):
    await state.update_data(title=message.text)
    await state.set_state(TaskStates.DESCRIPTION)
    await message.reply("Great! Now, please enter a description for the task:")

@dp.message(TaskStates.DESCRIPTION)
async def process_description(message: types.Message, state: FSMContext):
    await state.update_data(description=message.text)
    await state.set_state(TaskStates.PRICE)
    await message.reply("Excellent! Now, please enter the price for this task:")

@dp.message(TaskStates.PRICE)
async def process_price(message: types.Message, state: FSMContext):
    if not message.text.replace('.', '', 1).isdigit():
        return await message.reply("Invalid price. Please enter a numeric value:")
    
    await state.update_data(price=float(message.text))
    
    try:
        authenticate_pocketbase()
        # Fetch all contracts without filtering
        contracts = pb.collection('Contract').get_full_list(200)
        
        # Filter and sort contracts manually
        active_contracts = [
            contract for contract in contracts
            if getattr(contract, 'status', '').lower() == 'active'
        ]
        sorted_contracts = sorted(active_contracts, key=lambda x: getattr(x, 'created', ''), reverse=True)
        
        if not sorted_contracts:
            await message.reply("No active contracts available. The task will be created without a contract.")
            await save_task(state)
            await state.clear()
        else:
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text=contract.title, callback_data=f"contract_{contract.id}")]
                for contract in sorted_contracts
            ] + [[InlineKeyboardButton(text="No Contract", callback_data="contract_none")]])
            
            await state.set_state(TaskStates.CONTRACT)
            await message.reply("Please select a contract for this task:", reply_markup=keyboard)
    except Exception as e:
        logger.error(f"Error fetching contracts: {str(e)}")
        await message.reply(f"An error occurred while fetching contracts. Please try again later.")
        await state.clear()

# Update the contracts_command function similarly:
@dp.message(Command("contracts"))
async def contracts_command(message: types.Message):
    logger.info(f"Received /contracts command from user {message.from_user.id}")
    try:
        authenticate_pocketbase()
        contracts = pb.collection('Contract').get_full_list(200)
        
        if not contracts:
            await message.reply("No contracts available at the moment.")
            return

        # Sort the contracts manually
        sorted_contracts = sorted(contracts, key=lambda x: getattr(x, 'created', ''), reverse=True)

        reply_text = "Available Contracts:\n\n"
        for contract in sorted_contracts:
            reply_text += f"ID: {contract.id}\nTitle: {contract.title}\nStatus: {getattr(contract, 'status', 'N/A')}\n\n"

        await message.reply(reply_text)
    except Exception as e:
        logger.error(f"Error fetching contracts: {str(e)}")
        await message.reply(f"Error fetching contracts: {str(e)}")
        
@dp.callback_query(lambda c: c.data.startswith('contract_'))
async def process_contract(callback_query: types.CallbackQuery, state: FSMContext):
    contract_id = callback_query.data.split('_')[1]
    
    await state.update_data(contract=None if contract_id == "none" else contract_id)

    await save_task(state)
    await state.clear()
    await callback_query.answer()
    await callback_query.message.reply("Task added successfully!")

async def save_task(state: FSMContext):
    data = await state.get_data()
    try:
        authenticate_pocketbase()
        task = pb.collection('Task').create({
            "title": data['title'],
            "description": data['description'],
            "price": data['price'],
            "creator": data['user_id'],
            "contract": data.get('contract'),
        })
        logger.info(f"Task created with ID: {task.id}")
    except Exception as e:
        logger.error(f"Error saving task: {str(e)}")

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())