"""support editable profile images and payment-gated completion

Revision ID: 4a1b2c3d4e5f
Revises: 33c24d8e8dd1
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "4a1b2c3d4e5f"
down_revision: Union[str, Sequence[str], None] = "33c24d8e8dd1"
branch_labels = None
depends_on = None

def upgrade() -> None:
    with op.batch_alter_table("customer_profiles") as batch_op:
        batch_op.alter_column("profile_image", existing_type=sa.String(length=500), type_=sa.Text(), existing_nullable=True)
    with op.batch_alter_table("worker_profiles") as batch_op:
        batch_op.alter_column("profile_image", existing_type=sa.String(length=500), type_=sa.Text(), existing_nullable=True)

def downgrade() -> None:
    with op.batch_alter_table("customer_profiles") as batch_op:
        batch_op.alter_column("profile_image", existing_type=sa.Text(), type_=sa.String(length=500), existing_nullable=True)
    with op.batch_alter_table("worker_profiles") as batch_op:
        batch_op.alter_column("profile_image", existing_type=sa.Text(), type_=sa.String(length=500), existing_nullable=True)
