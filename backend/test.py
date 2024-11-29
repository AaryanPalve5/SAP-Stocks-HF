from chromadb import PersistentClient

def list_chroma_collections(db_path="chroma_stock"):
    try:
        # Initialize the Chroma Persistent Client
        chroma_client = PersistentClient(path=db_path)
        
        # Retrieve all collections
        collections = chroma_client.list_collections()
        
        # Print the collection names
        if collections:
            print("Available collections:")
            for collection in collections:
                print(collection.name)
        else:
            print("No collections found in the Chroma database.")

    except Exception as e:
        print(f"Error retrieving collections: {e}")

if __name__ == "__main__":
    # Specify the path to the Chroma database
    list_chroma_collections()
